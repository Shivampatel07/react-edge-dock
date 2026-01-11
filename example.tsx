import React, { useState } from 'react';
import { EdgeDock, useEdgeDock, DockMode, DockState } from './src';

/**
 * Example 1: Basic usage with auto-docking
 */
export function Example1() {
  return (
    <EdgeDock
      dockMode="auto"
      animation={true}
      button={<CustomButton>🚀</CustomButton>}
      popup={<BasicPopup />}
    />
  );
}

/**
 * Example 2: Manual docking to a specific edge
 */
export function Example2() {
  return (
    <EdgeDock
      dockMode="manual"
      dockEdge="right"
      animation={true}
      button={<CustomButton>📌</CustomButton>}
      popup={
        <div style={popupContainerStyle}>
          <h3>Pinned to Right</h3>
          <p>This dock is always on the right edge</p>
        </div>
      }
    />
  );
}

/**
 * Example 3: Free mode (no snapping)
 */
export function Example3() {
  return (
    <EdgeDock
      dockMode="free"
      animation={false}
      position={{ x: 100, y: 100 }}
      button={<CustomButton>🎯</CustomButton>}
      popup={
        <div style={popupContainerStyle}>
          <h3>Free Movement</h3>
          <p>Drag me anywhere!</p>
        </div>
      }
    />
  );
}

/**
 * Example 4: Using render props with state
 */
export function Example4() {
  return (
    <EdgeDock
      dockMode="auto"
      animation={true}
      button={(state) => (
        <CustomButton>
          {state.isDragging ? '✋' : '👆'}
        </CustomButton>
      )}
      popup={(state, close) => (
        <div style={popupContainerStyle}>
          <h3>Dynamic Content</h3>
          <p>Position: {Math.round(state.position.x)}, {Math.round(state.position.y)}</p>
          <p>Docked: {state.dockedEdge || 'none'}</p>
          <button onClick={close} style={buttonStyle}>Close</button>
        </div>
      )}
    />
  );
}

/**
 * Example 5: Controlled state
 */
export function Example5() {
  const [isOpen, setIsOpen] = useState(false);
  const [dockState, setDockState] = useState<DockState | null>(null);

  return (
    <div>
      <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 10000 }}>
        <button onClick={() => setIsOpen(!isOpen)} style={buttonStyle}>
          {isOpen ? 'Close' : 'Open'} Popup
        </button>
        {dockState && (
          <div style={{ marginTop: 10, fontSize: 12, background: 'white', padding: 10, borderRadius: 4 }}>
            <div>Edge: {dockState.dockedEdge || 'none'}</div>
            <div>Pos: ({Math.round(dockState.position.x)}, {Math.round(dockState.position.y)})</div>
          </div>
        )}
      </div>

      <EdgeDock
        dockMode="auto"
        animation={true}
        isPopupOpen={isOpen}
        onPopupChange={setIsOpen}
        onDockChange={setDockState}
        button={<CustomButton>🎮</CustomButton>}
        popup={
          <div style={popupContainerStyle}>
            <h3>Controlled Popup</h3>
            <p>Control me from outside!</p>
          </div>
        }
      />
    </div>
  );
}

/**
 * Example 6: Using the hook directly
 */
export function Example6() {
  const {
    state,
    buttonRef,
    popupRef,
    buttonStyles,
    popupStyles,
    buttonProps,
  } = useEdgeDock({
    dockMode: 'auto',
    animation: true,
    popupGap: 16,
  });

  return (
    <>
      <div ref={buttonRef} style={buttonStyles} onPointerDown={buttonProps.onPointerDown} onClick={buttonProps.onClick}>
        <div style={buttonProps.style}>
          <CustomButton>
            {state.isDragging ? '🤚' : '🖐️'}
          </CustomButton>
        </div>
      </div>

      <div ref={popupRef} style={popupStyles}>
        <div style={popupContainerStyle}>
          <h3>Custom Hook Usage</h3>
          <p>Built with useEdgeDock hook</p>
          <p>Currently {state.isDragging ? 'dragging' : 'idle'}</p>
        </div>
      </div>
    </>
  );
}

/**
 * Example 7: Complex popup with interactive content
 */
export function Example7() {
  const [count, setCount] = useState(0);
  const [mode, setMode] = useState<DockMode>('auto');

  return (
    <EdgeDock
      dockMode={mode}
      animation={true}
      popupGap={20}
      button={
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        }}>
          ⚙️
        </div>
      }
      popup={(state, close) => (
        <div style={{
          ...popupContainerStyle,
          minWidth: 280,
        }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Settings Panel</h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>
              Dock Mode:
            </label>
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value as DockMode)}
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
            >
              <option value="free">Free</option>
              <option value="auto">Auto</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 14, margin: '0 0 8px 0' }}>
              Counter: <strong>{count}</strong>
            </p>
            <button 
              onClick={() => setCount(c => c + 1)}
              style={{ ...buttonStyle, marginRight: 8 }}
            >
              Increment
            </button>
            <button 
              onClick={() => setCount(0)}
              style={buttonStyle}
            >
              Reset
            </button>
          </div>

          <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
            <div>Edge: <strong>{state.dockedEdge || 'none'}</strong></div>
            <div>Position: <strong>({Math.round(state.position.x)}, {Math.round(state.position.y)})</strong></div>
          </div>

          <button 
            onClick={close}
            style={{ ...buttonStyle, width: '100%' }}
          >
            Close
          </button>
        </div>
      )}
    />
  );
}

/**
 * Example 8: Multiple docks on the same page
 */
export function Example8() {
  return (
    <>
      <EdgeDock
        dockMode="manual"
        dockEdge="left"
        position={{ x: 50, y: 100 }}
        button={<CustomButton>📝</CustomButton>}
        popup={
          <div style={popupContainerStyle}>
            <h3>Notes</h3>
            <textarea 
              style={{ width: '100%', height: 100, padding: 8 }}
              placeholder="Write your notes..."
            />
          </div>
        }
      />

      <EdgeDock
        dockMode="manual"
        dockEdge="right"
        position={{ x: window.innerWidth - 50, y: 100 }}
        zIndex={9998}
        button={<CustomButton>📊</CustomButton>}
        popup={
          <div style={popupContainerStyle}>
            <h3>Stats</h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Sessions: 42</li>
              <li>Duration: 2h 34m</li>
              <li>Score: 95%</li>
            </ul>
          </div>
        }
      />

      <EdgeDock
        dockMode="auto"
        position={{ x: window.innerWidth / 2, y: window.innerHeight - 50 }}
        button={<CustomButton>💬</CustomButton>}
        popup={
          <div style={popupContainerStyle}>
            <h3>Chat</h3>
            <p>Start a conversation...</p>
          </div>
        }
      />
    </>
  );
}

/**
 * Demo app showing all examples
 */
export function App() {
  const [activeExample, setActiveExample] = useState<number>(1);

  const examples = [
    { id: 1, name: 'Basic Auto-dock', component: <Example1 /> },
    { id: 2, name: 'Manual Edge', component: <Example2 /> },
    { id: 3, name: 'Free Mode', component: <Example3 /> },
    { id: 4, name: 'Render Props', component: <Example4 /> },
    { id: 5, name: 'Controlled State', component: <Example5 /> },
    { id: 6, name: 'Hook Usage', component: <Example6 /> },
    { id: 7, name: 'Complex Popup', component: <Example7 /> },
    { id: 8, name: 'Multiple Docks', component: <Example8 /> },
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Navigation */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderBottom: '1px solid #ddd',
        padding: '16px',
        zIndex: 10000,
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        <h2 style={{ width: '100%', margin: '0 0 12px 0' }}>
          React Edge Dock Examples
        </h2>
        {examples.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setActiveExample(ex.id)}
            style={{
              ...buttonStyle,
              background: activeExample === ex.id ? '#0070f3' : '#f0f0f0',
              color: activeExample === ex.id ? 'white' : 'black',
            }}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        marginTop: 120,
        padding: 24,
        minHeight: 'calc(100vh - 120px)',
      }}>
        <h3>Example {activeExample}: {examples[activeExample - 1].name}</h3>
        <p style={{ color: '#666' }}>
          Try dragging the floating button around the screen!
        </p>
      </div>

      {/* Active example */}
      {examples[activeExample - 1].component}
    </div>
  );
}

// Reusable components and styles

function CustomButton({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: '#0070f3',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      cursor: 'pointer',
    }}>
      {children}
    </div>
  );
}

function BasicPopup() {
  return (
    <div style={popupContainerStyle}>
      <h3 style={{ margin: '0 0 8px 0' }}>Hello!</h3>
      <p style={{ margin: 0 }}>This is a popup</p>
    </div>
  );
}

const popupContainerStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 8,
  padding: 16,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  minWidth: 200,
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 4,
  border: 'none',
  background: '#0070f3',
  color: 'white',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
};
