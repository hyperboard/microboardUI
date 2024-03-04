import { App } from 'App';
import Cookies from 'js-cookie';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

type RootViewProps = {
  app: App;
}

const RootView: React.FC<RootViewProps> = ({app}) => {
  const navigate = useNavigate();

  const createPublicBoard = async (app: App): Promise<string> => {
    const board = await app.createPublicBoard();
    app.openBoard(board);
    return board;
  }

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");
    if (!accessToken || !refreshToken) {
      createPublicBoard(app).then((boardId) => {
        navigate(`/boards/${boardId}`);
      })
    } else {
      navigate("dashboard")
    } 
  });
  
  return (
    <div>RootView</div>
  )
}

export default RootView