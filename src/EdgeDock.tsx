import React from 'react';
import { useEdgeDock } from './useEdgeDock';
import type { EdgeDockProps } from './types';

/**
 * EdgeDock - A customizable draggable edge-docked floating button with popup
 * 
 * @example
 * ```tsx
 * <EdgeDock
 *   dockMode="auto"
 *   animation={true}
 *   button={<button>Click me</button>}
 *   popup={<div>Popup content</div>}
 * />
 * ```
 */
export function EdgeDock(props: EdgeDockProps) {
  const {
    button,
    popup,
    className,
    style,
    dockMode,
    dockEdge,
    allowedEdges,
    position,
    animation,
    popupGap,
    edgeOffset,
    zIndex,
    onDockChange,
    isPopupOpen,
    onPopupChange,
    draggable,
  } = props;

  const {
    state,
    buttonRef,
    popupRef,
    closePopup,
    buttonStyles,
    popupStyles,
    buttonProps,
  } = useEdgeDock({
    dockMode,
    dockEdge,
    allowedEdges,
    position,
    animation,
    popupGap,
    edgeOffset,
    zIndex,
    onDockChange,
    isPopupOpen,
    onPopupChange,
    draggable,
  });

  // Render button content
  const renderButton = () => {
    if (typeof button === 'function') {
      return button(state);
    }
    return button || <DefaultButton />;
  };

  // Render popup content
  const renderPopup = () => {
    if (!popup) return null;

    if (typeof popup === 'function') {
      return popup(state, closePopup);
    }
    return popup;
  };

  return (
    <>
      {/* Button Container */}
      <div
        ref={buttonRef}
        className={className}
        style={style ? { ...buttonStyles, ...style } : buttonStyles}
        onPointerDown={buttonProps.onPointerDown}
        onClick={buttonProps.onClick}
      >
        <div style={buttonProps.style}>
          {renderButton()}
        </div>
      </div>

      {/* Popup Container */}
      {popup && (
        <div
          ref={popupRef}
          style={popupStyles}
          onClick={(e) => e.stopPropagation()}
        >
          {renderPopup()}
        </div>
      )}
    </>
  );
}

/**
 * Default button component
 */
function DefaultButton() {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: '#0070f3',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      ⚡
    </div>
  );
}
