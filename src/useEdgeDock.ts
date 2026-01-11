import { useRef, useState, useCallback, useEffect } from 'react';
import type {
  EdgeDockConfig,
  DockState,
  Position,
  DockEdge,
  UseEdgeDockReturn,
  ViewportBounds,
  ElementDimensions,
  EdgeOffset,
} from './types';

/**
 * Check if code is running in browser (SSR-safe)
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Get viewport dimensions safely (SSR-compatible)
 */
function getViewport(): ViewportBounds {
  if (!isBrowser) {
    return { width: 1920, height: 1080 }; // Default fallback for SSR
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

/**
 * Get offset value for a specific edge
 */
function getOffsetForEdge(edgeOffset: EdgeOffset | undefined, edge: DockEdge): number {
  if (!edgeOffset) return 0;
  if (typeof edgeOffset === 'number') return edgeOffset;
  return edgeOffset[edge] ?? 0;
}

/**
 * Calculate which edge is closest to the given position
 */
function getClosestEdge(
  pos: Position,
  viewport: ViewportBounds,
  allowedEdges?: DockEdge[]
): DockEdge {
  const distanceToLeft = pos.x;
  const distanceToRight = viewport.width - pos.x;
  const distanceToTop = pos.y;
  const distanceToBottom = viewport.height - pos.y;

  // Create map of edges with their distances
  const edgeDistances: Array<{ edge: DockEdge; distance: number }> = [
    { edge: 'left', distance: distanceToLeft },
    { edge: 'right', distance: distanceToRight },
    { edge: 'top', distance: distanceToTop },
    { edge: 'bottom', distance: distanceToBottom },
  ];

  // Filter by allowed edges if specified
  const validEdges = allowedEdges
    ? edgeDistances.filter(({ edge }) => allowedEdges.includes(edge))
    : edgeDistances;

  // Find the closest edge
  const closest = validEdges.reduce((min, current) =>
    current.distance < min.distance ? current : min
  );

  return closest.edge;
}

/**
 * Snap position to edge based on dock mode
 */
function snapToEdge(
  pos: Position,
  edge: DockEdge,
  viewport: ViewportBounds,
  buttonDimensions: ElementDimensions,
  edgeOffset: EdgeOffset | undefined
): Position {
  const halfWidth = buttonDimensions.width / 2;
  const halfHeight = buttonDimensions.height / 2;
  const offset = getOffsetForEdge(edgeOffset, edge);

  switch (edge) {
    case 'left':
      return {
        x: halfWidth + offset,
        y: Math.max(halfHeight, Math.min(viewport.height - halfHeight, pos.y)),
      };
    case 'right':
      return {
        x: viewport.width - halfWidth - offset,
        y: Math.max(halfHeight, Math.min(viewport.height - halfHeight, pos.y)),
      };
    case 'top':
      return {
        x: Math.max(halfWidth, Math.min(viewport.width - halfWidth, pos.x)),
        y: halfHeight + offset,
      };
    case 'bottom':
      return {
        x: Math.max(halfWidth, Math.min(viewport.width - halfWidth, pos.x)),
        y: viewport.height - halfHeight - offset,
      };
  }
}

/**
 * Constrain position within viewport bounds, respecting edge offsets
 */
function constrainToViewport(
  pos: Position,
  viewport: ViewportBounds,
  buttonDimensions: ElementDimensions,
  edgeOffset?: EdgeOffset
): Position {
  const halfWidth = buttonDimensions.width / 2;
  const halfHeight = buttonDimensions.height / 2;

  const leftOffset = getOffsetForEdge(edgeOffset, 'left');
  const rightOffset = getOffsetForEdge(edgeOffset, 'right');
  const topOffset = getOffsetForEdge(edgeOffset, 'top');
  const bottomOffset = getOffsetForEdge(edgeOffset, 'bottom');

  return {
    x: Math.max(halfWidth + leftOffset, Math.min(viewport.width - halfWidth - rightOffset, pos.x)),
    y: Math.max(halfHeight + topOffset, Math.min(viewport.height - halfHeight - bottomOffset, pos.y)),
  };
}

/**
 * Calculate popup position based on button position
 */
function calculatePopupPosition(
  buttonPos: Position,
  buttonDimensions: ElementDimensions,
  popupDimensions: ElementDimensions,
  viewport: ViewportBounds,
  gap: number
): { position: Position; origin: string } {
  const halfButtonWidth = buttonDimensions.width / 2;
  const halfButtonHeight = buttonDimensions.height / 2;

  // Determine optimal placement
  const spaceRight = viewport.width - (buttonPos.x + halfButtonWidth);
  const spaceLeft = buttonPos.x - halfButtonWidth;
  const spaceBottom = viewport.height - (buttonPos.y + halfButtonHeight);
  const spaceTop = buttonPos.y - halfButtonHeight;

  let x = buttonPos.x;
  let y = buttonPos.y;
  let origin = 'center';

  // Horizontal positioning
  if (spaceRight >= popupDimensions.width + gap) {
    // Open to the right
    x = buttonPos.x + halfButtonWidth + gap;
    origin = 'left';
  } else if (spaceLeft >= popupDimensions.width + gap) {
    // Open to the left
    x = buttonPos.x - halfButtonWidth - gap - popupDimensions.width;
    origin = 'right';
  } else {
    // Center horizontally
    x = Math.max(
      0,
      Math.min(viewport.width - popupDimensions.width, buttonPos.x - popupDimensions.width / 2)
    );
  }

  // Vertical positioning
  if (spaceBottom >= popupDimensions.height + gap) {
    // Open downward
    y = buttonPos.y + halfButtonHeight + gap;
    origin = origin === 'left' || origin === 'right' ? `${origin} top` : 'top';
  } else if (spaceTop >= popupDimensions.height + gap) {
    // Open upward
    y = buttonPos.y - halfButtonHeight - gap - popupDimensions.height;
    origin = origin === 'left' || origin === 'right' ? `${origin} bottom` : 'bottom';
  } else {
    // Center vertically
    y = Math.max(
      0,
      Math.min(viewport.height - popupDimensions.height, buttonPos.y - popupDimensions.height / 2)
    );
  }

  return {
    position: { x, y },
    origin,
  };
}

/**
 * Main hook for edge dock functionality
 */
export function useEdgeDock(config: EdgeDockConfig = {}): UseEdgeDockReturn {
  const {
    dockMode = 'auto',
    dockEdge,
    allowedEdges,
    position: controlledPosition,
    animation = true,
    popupGap = 12,
    edgeOffset,
    zIndex = 9999,
    onDockChange,
    isPopupOpen: controlledPopupOpen,
    onPopupChange,
  } = config;

  const buttonRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);

  // Use a fixed initial position to avoid SSR hydration mismatch
  // This will be updated after mount on the client
  const [position, setPositionInternal] = useState<Position>(
    controlledPosition || { x: 100, y: 100 }
  );
  const [dockedEdge, setDockedEdge] = useState<DockEdge | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPopupOpenInternal, setIsPopupOpenInternal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [popupPosition, setPopupPosition] = useState<Position>({ x: 0, y: 0 });
  const [popupOrigin, setPopupOrigin] = useState('center');

  // Drag state
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    hasMoved: false,
  });

  const isPopupOpen = controlledPopupOpen ?? isPopupOpenInternal;

  // Get current state
  const state: DockState = {
    position,
    dockedEdge,
    isDragging,
    isPopupOpen,
  };

  // Initialize position after mount (client-side only) to avoid hydration mismatch
  useEffect(() => {
    if (!isMountedRef.current && !controlledPosition && buttonRef.current) {
      isMountedRef.current = true;
      const viewport = getViewport();
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const buttonDimensions = { width: buttonRect.width, height: buttonRect.height };
      
      // Set initial position on client after mount
      let initialPos = { x: viewport.width - 60, y: viewport.height - 60 };
      initialPos = constrainToViewport(initialPos, viewport, buttonDimensions, edgeOffset);

      if (dockMode === 'auto') {
        const edge = getClosestEdge(initialPos, viewport, allowedEdges);
        initialPos = snapToEdge(initialPos, edge, viewport, buttonDimensions, edgeOffset);
        setDockedEdge(edge);
      } else if (dockMode === 'manual' && dockEdge) {
        initialPos = snapToEdge(initialPos, dockEdge, viewport, buttonDimensions, edgeOffset);
        setDockedEdge(dockEdge);
      }

      setPositionInternal(initialPos);
    }
  }, [controlledPosition, dockMode, dockEdge, allowedEdges, edgeOffset]);

  // Update controlled position
  useEffect(() => {
    if (controlledPosition) {
      setPositionInternal(controlledPosition);
    }
  }, [controlledPosition]);

  // Calculate popup position when it opens or button moves
  useEffect(() => {
    if (isPopupOpen && buttonRef.current && popupRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      
      const result = calculatePopupPosition(
        position,
        { width: buttonRect.width, height: buttonRect.height },
        { width: popupRect.width, height: popupRect.height },
        getViewport(),
        popupGap
      );

      setPopupPosition(result.position);
      setPopupOrigin(result.origin);
    }
  }, [isPopupOpen, position, popupGap]);

  // Notify state changes
  useEffect(() => {
    if (onDockChange) {
      onDockChange(state);
    }
  }, [position, dockedEdge, isDragging, isPopupOpen]);

  // Set position with constraints
  const setPosition = useCallback((newPos: Position) => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewport = getViewport();
    const buttonDimensions = { width: buttonRect.width, height: buttonRect.height };

    let finalPos = constrainToViewport(newPos, viewport, buttonDimensions, edgeOffset);

    if (dockMode === 'auto') {
      const edge = getClosestEdge(finalPos, viewport, allowedEdges);
      finalPos = snapToEdge(finalPos, edge, viewport, buttonDimensions, edgeOffset);
      setDockedEdge(edge);
    } else if (dockMode === 'manual' && dockEdge) {
      finalPos = snapToEdge(finalPos, dockEdge, viewport, buttonDimensions, edgeOffset);
      setDockedEdge(dockEdge);
    } else {
      setDockedEdge(null);
    }

    setPositionInternal(finalPos);
  }, [dockMode, dockEdge, allowedEdges, edgeOffset]);

  // Toggle popup
  const togglePopup = useCallback(() => {
    const newState = !isPopupOpen;
    if (controlledPopupOpen === undefined) {
      setIsPopupOpenInternal(newState);
    }
    onPopupChange?.(newState);
  }, [isPopupOpen, controlledPopupOpen, onPopupChange]);

  const closePopup = useCallback(() => {
    if (controlledPopupOpen === undefined) {
      setIsPopupOpenInternal(false);
    }
    onPopupChange?.(false);
  }, [controlledPopupOpen, onPopupChange]);

  const openPopup = useCallback(() => {
    if (controlledPopupOpen === undefined) {
      setIsPopupOpenInternal(true);
    }
    onPopupChange?.(true);
  }, [controlledPopupOpen, onPopupChange]);

  // Pointer down handler
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!buttonRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      hasMoved: false,
    };

    setIsDragging(true);
    setIsAnimating(false);

    // Close popup when starting to drag
    if (isPopupOpen) {
      closePopup();
    }
  }, [position, isPopupOpen, closePopup]);

  // Pointer move handler
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStateRef.current.isDragging || !buttonRef.current) return;

      const deltaX = e.clientX - dragStateRef.current.startX;
      const deltaY = e.clientY - dragStateRef.current.startY;

      // Mark as moved if dragged more than 5px
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        dragStateRef.current.hasMoved = true;
      }

      const newPos = {
        x: dragStateRef.current.startPosX + deltaX,
        y: dragStateRef.current.startPosY + deltaY,
      };

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const buttonDimensions = { width: buttonRect.width, height: buttonRect.height };

      // During drag, only constrain to viewport (no snapping)
      const constrainedPos = constrainToViewport(newPos, viewport, buttonDimensions, edgeOffset);
      setPositionInternal(constrainedPos);
    };

    const handlePointerUp = () => {
      if (!dragStateRef.current.isDragging) return;

      dragStateRef.current.isDragging = false;
      setIsDragging(false);

      // Apply snapping after drag ends
      if (animation) {
        setIsAnimating(true);
      }
      
      // Snap to edge if needed
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewport = getViewport();
        const buttonDimensions = { width: buttonRect.width, height: buttonRect.height };

        let finalPos = position;

        if (dockMode === 'auto') {
          const edge = getClosestEdge(position, viewport, allowedEdges);
          finalPos = snapToEdge(position, edge, viewport, buttonDimensions, edgeOffset);
          setDockedEdge(edge);
        } else if (dockMode === 'manual' && dockEdge) {
          finalPos = snapToEdge(position, dockEdge, viewport, buttonDimensions, edgeOffset);
          setDockedEdge(dockEdge);
        }

        setPositionInternal(finalPos);
      }
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [position, dockMode, dockEdge, animation, edgeOffset, allowedEdges]);

  // Click handler (only trigger if not dragged)
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (dragStateRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    togglePopup();
  }, [togglePopup]);

  // Handle window resize
  useEffect(() => {
    if (!isBrowser) return;

    const handleResize = () => {
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewport = getViewport();
        const buttonDimensions = { width: buttonRect.width, height: buttonRect.height };

        let newPos = constrainToViewport(position, viewport, buttonDimensions, edgeOffset);

        if (dockMode === 'auto') {
          const edge = getClosestEdge(newPos, viewport, allowedEdges);
          newPos = snapToEdge(newPos, edge, viewport, buttonDimensions, edgeOffset);
          setDockedEdge(edge);
        } else if (dockMode === 'manual' && dockEdge) {
          newPos = snapToEdge(newPos, dockEdge, viewport, buttonDimensions, edgeOffset);
        }

        setPositionInternal(newPos);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, dockMode, dockEdge, edgeOffset, allowedEdges]);

  // Button styles
  const buttonStyles: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    top: 0,
    transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
    transition: isAnimating && animation ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
    userSelect: 'none',
    zIndex,
    willChange: isDragging ? 'transform' : 'auto',
  };

  // Popup styles
  const popupStyles: React.CSSProperties = {
    position: 'fixed',
    left: popupPosition.x,
    top: popupPosition.y,
    zIndex: zIndex + 1,
    opacity: isPopupOpen ? 1 : 0,
    pointerEvents: isPopupOpen ? 'auto' : 'none',
    transformOrigin: popupOrigin,
    transform: isPopupOpen ? 'scale(1)' : 'scale(0.95)',
    transition: animation ? 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
  };

  const buttonProps = {
    onPointerDown: handlePointerDown,
    onClick: handleClick,
    style: { userSelect: 'none' as const, touchAction: 'none' as const },
  };

  return {
    state,
    buttonRef,
    popupRef,
    togglePopup,
    closePopup,
    openPopup,
    setPosition,
    buttonStyles,
    popupStyles,
    buttonProps,
  };
}
