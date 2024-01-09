import * as React from "react";
import { App } from "App";
import { SidePanelMenuOffset } from "./SidePanel";
import { Menu } from "./Menu";
import { BoardIcon } from "View/Icon/BoardIcon";

class PublicBoardsState {
	isOpen = true;
	contextMenuItem: string | undefined = undefined;
  editingBoardId: string | undefined = undefined;
}

export class PublicBoards extends React.PureComponent<{
	app: App;
},
PublicBoardsState> {
	animationFrameId: number | null = null;

	state = new PublicBoardsState();

	toggleMenu = (): void => {
		this.setState(prevState => ({
			isOpen: !prevState.isOpen,
		}));
	};

	update = (): void => {
		if (this.animationFrameId) {
			return; // Function already scheduled to run
		}

		this.animationFrameId = requestAnimationFrame(() => {
			this.forceUpdate();
			this.animationFrameId = null;
		});
	};

  handleRename = (boardId: string) => {
    this.setState({
      editingBoardId: boardId,
      contextMenuItem: undefined, // Close context menu
    });
  };

  handleCancel = () => {
    this.setState({
      editingBoardId: undefined
    });
  }

  handleSave = (boardId: string, newName: string) => {
    this.props.app.storage.setPublicBoard({
      boardId: boardId, 
      name: newName
    });
    this.setState({
      editingBoardId: undefined
    });
  };

  handleRemove = (boardId: string) => {
    // Implement logic to remove the board.
    // e.g., this.props.app.storage.removePublicBoard(boardId);
    this.setState({
      contextMenuItem: undefined // Close context menu
    });
  };

	componentDidMount(): void {
		this.props.app.storage.subject.subscribe(this.update);
	}

	componentDidUpdate(): void {}

	componentWillUnmount(): void {
		this.props.app.storage.subject.unsubscribe(this.update);
	}

	render(): React.ReactElement | null {

    const { isOpen, editingBoardId, contextMenuItem } = this.state;
    const boards = this.props.app.storage.listPublicBoards();
	const offset = SidePanelMenuOffset;

    return (
      <Menu
        isOpen={isOpen}
        offset={0}
        onToggle={this.toggleMenu}
        heading={"Public Boards"}
      >
        {boards.map((board) =>
            <div key={board.boardId}>
				<Menu
					key={board.boardId}
					heading={board.name ? board.name : `${board.boardId.substring(0, 5)}...${board.boardId.substring(board.boardId.length - 5)}`}
					offset={offset}
				  	onClick={() => {
				  		this.props.app.openBoard(board.boardId);
				  	}}
				  	onContextMenu={() => {
				  		this.setState({
				  			contextMenuItem: board.boardId
				  		})
				  	}}
		            icon={<BoardIcon width={20} height={20} />}
					onRename={(newName) => this.handleSave(board.boardId, newName)}
				>
				</Menu>

			  {contextMenuItem === board.boardId && (

				    <div>
				      <div onClick={() => this.handleRename(board.boardId)}>Rename</div>
				      <div onClick={() => this.handleRemove(board.boardId)}>Remove</div>
				    </div>
			  )}
			</div>
        )}
      </Menu>
    );
	}
}

