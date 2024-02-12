import * as React from "react";
import { Link } from 'react-router-dom';
import { Board } from "Board";
import { SidePanelState } from "View/SidePanel/SidePanelState";
import { Button } from "View/ContextPanel/Button";
import { SidePanelOpenIcon } from "View/Icon/SidePanelOpenIcon";
import { SidePanelCloseIcon } from "View/Icon/SidePanelCloseIcon";
import { useStyle } from "View";
import { ExportBoardSnapshotButton } from "App/ExportBoardSnapshot";
import { Modal } from "View/Modal/Modal";

export class TitlePanel extends React.Component<{
	board: Board;
	sidePanelState: SidePanelState;
}> {
	constructor(props) {
		super(props);

		this.state = {
			isModalVisible: false,
		};
	}

	update = (): void => {
		this.forceUpdate();
	};

	componentDidMount(): void {
		this.props.sidePanelState.subject.subscribe(this.update);
	}

	componentWillUnmount(): void {
		this.props.sidePanelState.subject.unsubscribe(this.update);
	}

	toggleSidePanel = () => {
		this.props.sidePanelState.toggle();
	};

	openModal = () => {
		this.setState({ isModalVisible: true });
	};

	closeModal = () => {
		this.setState({ isModalVisible: false });
	};

	render(): React.ReactElement {
		const isSidePanelOpen = this.props.sidePanelState.isOn;

		return (
			<div id="TitlePanel" className="TitlePanel">
				<SidePanelButton
					isOpen={isSidePanelOpen}
					toggle={this.toggleSidePanel}
				/>
				<Button
					id="Microboard"
					title="Microboard"
					onClick={() => {}}
					width={80}
				>
					<Link
						to={'/dashboard'}
						style={{
							display: "inline-block",
							color: "black",
							textDecoration: "none",
							paddingLeft: "4px",
							paddingRight: "4px",
							fontWeight: 600,
						}}
					>
						{"Microboard"}
					</Link>
				</Button>
				<span
					onClick={() => this.openModal()}
					style={{
						maxWidth: 100,
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
						margin: "auto",
						overflow: "hidden",
						cursor: "pointer"
					}}
				>
					{this.props.board?.boardId}
					{this.state.isModalVisible && <Modal boardLink={location.href} closeModal={this.closeModal} />}
				</span>
				<ExportBoardSnapshotButton board={this.props.board} />
			</div>
		);
	}
}

function SidePanelButton({
	isOpen,
	toggle,
}: {
	isOpen: boolean;
	toggle: () => void;
}): React.ReactElement {
	const IconComponent = isOpen ? SidePanelCloseIcon : SidePanelOpenIcon;
	return (
		<Button
			id={isOpen ? "CloseSidePanel" : "OpenSidePanel"}
			title={isOpen ? "Close Menu" : "Open Menu"}
			onClick={toggle}
			tipOnBottomLeft={true}
		>
			<IconComponent width={24} height={24} />
		</Button>
	);
}

useStyle(`
.TitlePanel {
	display: flex;
	position: absolute;
	top: 8px;
	left: 8px;
	background-color: white;
	border-radius: 4px;
	box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.12);
	padding-right: 4px;
	z-index: 100;
	-webkit-user-select: none; /* Safari */
	-ms-user-select: none; /* IE 10 and IE 11 */
	user-select: none; /* Standard syntax */
}
`);
