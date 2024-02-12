import React from 'react'
import styles from './DashboardView.module.css';
import { useNavigate } from 'react-router-dom';
import { App } from 'App';

interface BoardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
}

const BoardCard: React.FC<BoardCardProps> = ({ name }) => {
  const navigate = useNavigate();
  const onClick = () => {
    navigate(`/boards/${name}`);
  }

  return (
    <div className={styles["boardCard"]} onClick={onClick}>
      <div className={styles["boardCardBackground"]}>
      </div>
      <div className={styles["boardCardTitle"]}>
        {name}
      </div>
      <div className={styles["boardCardDate"]}>
        7 February, 2024, 12:00
      </div>
      
    </div>
  )
}

const AddBoard: React.FC<{app: App}> = ({app}) => {
  const navigate = useNavigate();

  return (
    <div className={styles["addBoard"]} onClick={async () => {
      const boardId = await app.createPublicBoard();
      console.log(boardId);
      if (boardId) {
        navigate(`/boards/${boardId}`);
      }
    }}>
      <span className={styles["addBoardPlus"]}>+</span>
    </div>
  )
}

export const DashboardView: React.FC<{app: App}> = (props) => {
  const navigate = useNavigate();
  const boards = props.app.storage.listPublicBoards();

  return (
    <div className={styles["dashboardWrapper"]}>
      <h1>Dashboard</h1>
      <div className={styles["boardGrid"]}>
        <AddBoard app={props.app} />
        {
        boards.map((board) => 
          <BoardCard 
            key={board.boardId} 
            name={board.name || board.boardId || 'Unnamed'} 
            onClick={() => {
              props.app.openBoard(board.boardId);
              navigate(`/boards/${board.boardId}`);
            }
          } />)
        }
      </div>
    </div>

  )
}
