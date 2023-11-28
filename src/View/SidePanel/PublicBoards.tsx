import * as React from "react";
import { App } from "App";
import { Menu, SidePanelMenuOffset } from "./SidePanel";

class PublicBoardsState {
	isOpen = true;
	contextMenuItem: string | undefined = undefined;
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

	componentDidMount(): void {
		this.props.app.storage.subject.subscribe(this.update);
	}

	componentDidUpdate(): void {}

	componentWillUnmount(): void {
		this.props.app.storage.subject.unsubscribe(this.update);
	}

	render(): React.ReactElement | null {
		const { isOpen } = this.state;
		const boards = this.props.app.storage.listPublicBoards();
		const boardLinks: React.ReactElement[] = [];
		const offset = SidePanelMenuOffset;
		const length = boards.length;
		const contextMenuItem = this.state.contextMenuItem;
		for (let i = 0; i<length; i++) {
			const board = boards[i];
			if (contextMenuItem === board.boardId) {
				boardLinks.push(
					<BoardNameInput
						board={board}
						offset={offset}
						onNameChange={(event) => {
							const inputValue = event.target.value;
							this.props.app.storage.setPublicBoard({...board, name: inputValue});
						}}
						closeContextMenu={() => {
							this.setState({
								contextMenuItem: undefined
							});
						}}
					/>						
				);
			} else {
				boardLinks.push(
					<BoardName
						board={board}
						offset={offset}
						onClick={() => {
							this.props.app.openBoard(board.boardId);
						}}
						onContextMenu={() => {
							this.setState({
								contextMenuItem: board.boardId
							})
						}}
					/>
				);
			}
		}
		
		return (
			<Menu
				isOpen={isOpen}
				offset={0}
				onToggle={this.toggleMenu}
				heading={"Public Boards"}
			>
				{boardLinks}
			</Menu>
		);
	}
}

function BoardName ({ 
	board, offset, onClick, onContextMenu
}): React.ReactElement{
	return (
		<Menu
			key={board.boardId}
			heading={board.name ? board.name : `${board.boardId.substring(0, 5)}...${board.boardId.substring(board.boardId.length - 5)}`}
			offset={offset}
			onToggle={onClick}
		>
				<span 
					className="SidePanelContextMenu" 
					onClick={onContextMenu}>...</span>
		</Menu>
	);
}

function BoardNameInput ({ 
    board, offset, onNameChange, closeContextMenu  
}): React.ReactElement {
    return (
        <li className={"SidePanelListElement"} key={board.boardId}>
            <div className="SidePanelMenuLine" style={{ paddingLeft: offset }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <input
						className="SidePanelInput"
                        style={{ flex: 1 }}
                        type="text"
                        value={board.name ? board.name : ""}
                        onChange={onNameChange}
                    />
                    <span 
						className="SidePanelContextMenu" 
						onClick={closeContextMenu}>...</span>
                </div>
            </div>
        </li>
    );
};
