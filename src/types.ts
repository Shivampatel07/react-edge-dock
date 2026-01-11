import { ReactNode } from 'react';

/**
 * Dock edge position
 */
export type DockEdge = 'left' | 'right' | 'top' | 'bottom';

/**
 * Dock mode determines how the button snaps
 */
export type DockMode = 'free' | 'auto' | 'manual';

/**
 * 2D position coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Dock state information
 */
export interface DockState {
  /** Current position in pixels */
  position: Position;
  /** Current docked edge (null if in free mode) */
  dockedEdge: DockEdge | null;
  /** Whether the button is currently being dragged */
  isDragging: boolean;
  /** Whether the popup is currently open */
  isPopupOpen: boolean;
}

/**
 * Edge offset configuration - can be a single number for all edges or individual values
 */
export type EdgeOffset = number | {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};

/**
 * Configuration for EdgeDock component
 */
export interface EdgeDockConfig {
  /** Docking behavior mode */
  dockMode?: DockMode;
  /** Fixed edge for manual dock mode */
  dockEdge?: DockEdge;
  /** Restrict which edges are allowed for docking (only works in auto mode) */
  allowedEdges?: DockEdge[];
  /** Initial or controlled position */
  position?: Position;
  /** Enable snap animations */
  animation?: boolean;
  /** Gap between button and popup in pixels */
  popupGap?: number;
  /** Offset from edge when docked - number for all edges or object for individual edges */
  edgeOffset?: EdgeOffset;
  /** z-index for the dock container */
  zIndex?: number;
  /** Callback when dock state changes */
  onDockChange?: (state: DockState) => void;
  /** Controlled popup open state */
  isPopupOpen?: boolean;
  /** Callback when popup state changes */
  onPopupChange?: (isOpen: boolean) => void;
}

/**
 * Props for EdgeDock component
 */
export interface EdgeDockProps extends EdgeDockConfig {
  /** Custom button element or render prop */
  button?: ReactNode | ((state: DockState) => ReactNode);
  /** Custom popup content or render prop */
  popup?: ReactNode | ((state: DockState, close: () => void) => ReactNode);
  /** Additional CSS class for container */
  className?: string;
  /** Additional inline styles for container */
  style?: React.CSSProperties;
}

/**
 * Return type for useEdgeDock hook
 */
export interface UseEdgeDockReturn {
  /** Current dock state */
  state: DockState;
  /** Ref to attach to draggable button element */
  buttonRef: React.RefObject<HTMLDivElement>;
  /** Ref to attach to popup element */
  popupRef: React.RefObject<HTMLDivElement>;
  /** Toggle popup open/closed */
  togglePopup: () => void;
  /** Close popup */
  closePopup: () => void;
  /** Open popup */
  openPopup: () => void;
  /** Set position programmatically */
  setPosition: (position: Position) => void;
  /** Inline styles for button container */
  buttonStyles: React.CSSProperties;
  /** Inline styles for popup container */
  popupStyles: React.CSSProperties;
  /** Props to spread on button for drag handling */
  buttonProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onClick: (e: React.MouseEvent) => void;
    style: React.CSSProperties;
  };
}

/**
 * Internal viewport bounds
 */
export interface ViewportBounds {
  width: number;
  height: number;
}

/**
 * Internal element dimensions
 */
export interface ElementDimensions {
  width: number;
  height: number;
}
