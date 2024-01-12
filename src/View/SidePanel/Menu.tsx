import * as React from "react";
import { useStyle } from "View/useStyle";

export class Menu extends React.Component<{
  isOpen: boolean;
  onToggle: () => void;
  heading: string;
  offset?: number;
  children?: React.ReactNode;
  onContextMenu?: () => void;
  onClick?: () => void;
  onRename?: (newHeading: string) => void; // Changed to receive newHeading
  icon?: React.ReactNode;
  additionalAction?: { label: string; icon: React.ReactNode; action: () => void };
  onDoubleClick?: () => void;
}> {
  state = {
    isRenaming: false,
    renameInput: this.props.heading, // Added to keep track of input value
  };

  handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (this.props.onContextMenu) {
      this.props.onContextMenu();
    }
  };

  handleDoubleClick = () => {
    // Check if onRename is provided to toggle renaming
    if (this.props.onRename) {
      this.setState({ isRenaming: !this.state.isRenaming });
    }
  };

  handleRenameChange = (e) => {
    // Update state with current input value
    this.setState({ renameInput: e.target.value });
  };

  handleRenameConfirm = () => {
    // Pass the current input value to onRename
    if (this.props.onRename) {
      this.props.onRename(this.state.renameInput);
    }
    this.setState({ isRenaming: false });
  };

  handleRenameCancel = () => {
    this.setState({ isRenaming: false, renameInput: this.props.heading });
  };

  handleToggle = (e) => {
    e.stopPropagation();
    this.props.onToggle();
  }

  render(): React.ReactElement | null {
    const {
      isOpen,
      onToggle,
      heading,
      offset,
      children,
      onContextMenu,
      onClick,
      icon,
      additionalAction,
    } = this.props;
    const { isRenaming, renameInput } = this.state;
    const hasChildren = Boolean(children);

    // Corrected the toggle of isRenaming with double click on the heading
    const handleDoubleClick = this.props.onRename ? this.handleDoubleClick : undefined;

    return (
      <li className="SidePanelListElement" onContextMenu={this.handleRightClick}>
        <div 
          className="SidePanelMenuToggle"
          onClick={onClick ? onClick : hasChildren ? onToggle : undefined}
          onDoubleClick={handleDoubleClick} // Applied corrected double click handler
        >
          <div
            className="SidePanelMenuToggleContent"
            style={{
              marginLeft: offset ? offset * 1 : 0,
            }}
          >
           <div>
            {hasChildren && (
              <button className="ToggleExpandButton" onClick={this.handleToggle}>
                {isOpen ? "▼" : "►"}
              </button>
            )}
            {icon && <button className="MenuIcon">{icon}</button>}
            {!isRenaming ? (
              <span className="MenuHeading" onDoubleClick={handleDoubleClick}>{heading}</span> // Applied double click handler to span
            ) : (
              <span className="RenamingInputContainer">
                <input 
                  type="text"
                  value={renameInput} // Controlled component, use value from state
                  onChange={this.handleRenameChange} // Added onChange handler to update state
                  className="RenamingInput"
                  autoFocus // Focus the input when it appears
                />
                <button onClick={this.handleRenameConfirm}>✓</button>
                <button onClick={this.handleRenameCancel}>✕</button>
              </span>
            )}
           </div>
            {additionalAction && !isRenaming && (
              <button
                className="AdditionalActionButton"
                onClick={(e) => {
                  e.stopPropagation();
                  additionalAction.action();
                }}
              >
                {additionalAction.icon}
              </button>
            )}
            {onContextMenu && !isRenaming && (
              <button
                className="SidePanelContextMenuButton"
                onClick={(e) => {
                  e.stopPropagation();
                  onContextMenu();
                }}
              >
                &nbsp;...&nbsp;
              </button>
            )}
          </div>
        </div>
        {hasChildren && (
          <ul
            className="SidePanelMenuList"
            style={{
              display: isOpen ? "block" : "none",
            }}
          >
            {children}
          </ul>
        )}
      </li>
    );
  }
}
useStyle(`
.SidePanelMenuToggle {
  padding-top: 4px;
  padding-bottom: 4px;
  cursor: pointer;
  border: 1px solid rgba(100,150,255,0);
  user-select: none;
}

.SidePanelMenuToggle:hover {
  color: blue;
  border: 1px solid rgba(100,150,255,1);
}

.SidePanelMenuToggleContent {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ToggleExpandButton {
  cursor: pointer;
  user-select: none;
  background: none;
  border: none;
}

.ToggleExpandButton:hover {
  color: blue;
}


.MenuHeading {
  color: black;
}

.MenuHeading:hover {
  color: blue;
}

.MenuIcon {
  padding: 0px;
  background: none;
  border: solid transparent 1px;
  vertical-align: middle;
  height: 22px;
  width: 24px;
  margin-left: 4px;
  margin-right: 4px;
}

.MenuIcon:hover {
}

.SidePanelContextMenuButton {
  cursor: pointer;
  padding: 0;
  user-select: none;
  background: none;
  border: none;
}

.SidePanelContextMenuButton:hover {
  color: blue;
}

.RenamingInputContainer {
}

.RenamingInput {
  margin-right: 8px;
}

.AdditionalActionButton {
  cursor: pointer;
  user-select: none;
  background: none;
  border: none;
}

.AdditionalActionButton:hover {
  color: blue;
}
`);
