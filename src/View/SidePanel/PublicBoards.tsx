import * as React from "react";
import { App } from "App";
import { SidePanelMenuOffset } from "./SidePanel";
import { Menu } from "./Menu";
import { BoardIcon } from "View/Icon/BoardIcon";
import { Icon } from "View/Icon";
import { ContextMenuState } from "View/ContextMenu";
import { WithRouterProps, withRouter } from "lib/withRouter";

class PublicBoardsState {
	isOpen = true;
	contextMenuItem: string | undefined = undefined;
    renamingItem: string | null;
  editingBoardId: string | undefined = undefined;
  draggedBoardId: string | undefined = undefined;
  dragOverBoardId: string | undefined = undefined;
}

interface Props extends WithRouterProps {
	app: App;
	contextMenuState: ContextMenuState;
}

class PublicBoardsBase extends React.PureComponent<Props, PublicBoardsState> {
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
	  renamingItem: null
    });
	this.props.contextMenuState.toggleOff();
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
    this.props.app.storage.removePublicBoard(boardId);
    this.setState({
      renamingItem: null
    });
	this.props.contextMenuState.toggleOff();
  };

	componentDidMount(): void {
		this.props.app.storage.subject.subscribe(this.update);
	}

	componentDidUpdate(): void {}

	componentWillUnmount(): void {
		this.props.app.storage.subject.unsubscribe(this.update);
	}

  handleDragStart = (e: React.DragEvent<HTMLDivElement>, boardId: string): void => {
    e.dataTransfer.effectAllowed = 'move';
    this.setState({ draggedBoardId: boardId });
  };

  handleDragOver = (e: React.DragEvent<HTMLDivElement>, boardId: string): void => {
    e.preventDefault();
    this.setState({ dragOverBoardId: boardId });
  };

  handleDrop = (e: React.DragEvent<HTMLDivElement>, boardId: string): void => {
    e.preventDefault();
    e.stopPropagation();
    const { draggedBoardId, dragOverBoardId } = this.state;
    if (draggedBoardId && dragOverBoardId) {
      // Logic to reorder the boards
      this.props.app.storage.reorderPublicBoard(draggedBoardId, dragOverBoardId);
      this.setState({
        draggedBoardId: undefined,
        dragOverBoardId: undefined,
      });
      this.update();
    }
  };

  handleDragEnd = (): void => {
    this.setState({
      draggedBoardId: undefined,
      dragOverBoardId: undefined,
    });
  };

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
		additionalAction={{
			label: "AddBoard",
			icon: <Icon name="ZoomIn" width={20} height={20} />,
			action: () => {
				const app = this.props.app;
				app.createPublicBoard().then((id: stirng) => {
					app.openBoard(id);
				});
			}
		}}
      >
        {boards.map((board) =>
            <div
			 key={board.boardId}
             draggable
             onDragStart={(e) => this.handleDragStart(e, board.boardId)}
             onDragOver={(e) => this.handleDragOver(e, board.boardId)}
             onDrop={(e) => this.handleDrop(e, board.boardId)}
             onDragEnd={this.handleDragEnd}
			>
				<Menu
					
					key={board.boardId}
					heading={board.name ? board.name : `${board.boardId.substring(0, 5)}...${board.boardId.substring(board.boardId.length - 5)}`}
					offset={offset}
				  	onClick={() => {
							this.props.app.openBoard(board.boardId);
							this.props.router.navigate(`/boards/${board.boardId}`, {replace: true});

				  	}}
					isRenaming={this.state.renamingItem === board.boardId}
				  	onContextMenu={(x, y) => {
						this.props.contextMenuState.toggle({
							targetId: `SidePanelPublicBoard-${board.boardId}`,
							position: {x, y},
							options: [
								{ 
									label: "Rename",
									action: () => {
										this.setState({
											renamingItem: board.boardId
										});
									}
								},
								{ 
									label: "Delete",
									action: () => {
										this.handleRemove(board.boardId);
										if (board.boardId === this.props?.router?.params.boardId) {
											this.props?.router?.navigate('/');
										}
									}
								}
							]
						});
				  	}}
		            icon={<BoardIcon width={20} height={20} />}
					onRename={(newName) => {this.handleSave(board.boardId, newName); this.handleRename();}}
				>
				</Menu>
			</div>
        )}
      </Menu>
    );
	}
}

export const PublicBoards = withRouter(PublicBoardsBase);