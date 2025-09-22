import React, { useState, useEffect, useCallback } from "react";
import styles from "./AdminPage.module.css";
import { Input } from "shared/ui-lib/Input";
import { Button } from "shared/ui-lib/Button";
import clsx from "clsx";
import { BoardWithUsers } from "shared/api/boards";
import { boardsApi } from "shared/api";
import { UiModalBackground, useUiModalContext } from "shared/ui-lib/UiModal";
import {
  MANAGE_ACCESS_MODAL,
  ManageAccessModal,
} from "pages/AdminPage/ManageAccessModal/ManageAccessModal";
import {
  MANAGE_USERS_MODAL,
  ManageUsersModal,
} from "pages/AdminPage/ManageUsersModal/ManageUsersModal";
import {
  CONFIRM_DELETE_MODAL,
  ConfirmDeleteModal,
} from "pages/AdminPage/ConfirmDeleteModal/ConfirmDeleteModal";
import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton";
import { useNavigate } from "react-router-dom";

export const AdminDashboardPage = () => {
  const [boards, setBoards] = useState<BoardWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openModal, setModalData } = useUiModalContext();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBoardsData = useCallback(
    async (page: number, pageSize: number, query: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = (
          await boardsApi.getBoardsWithUsers(page, pageSize, query)
        ).data;
        if (!response) {
          setError(
            "Не удалось загрузить данные. Попробуйте обновить страницу.",
          );
          return;
        }
        setBoards(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.total,
          current: page,
          pageSize,
        }));
      } catch (err) {
        setError("Не удалось загрузить данные. Попробуйте обновить страницу.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchBoardsData(pagination.current, pagination.pageSize, searchQuery);
  }, [fetchBoardsData, pagination.current, pagination.pageSize, searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (
      newPage > 0 &&
      newPage <= Math.ceil(pagination.total / pagination.pageSize)
    ) {
      setPagination((prev) => ({ ...prev, current: newPage }));
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setSearchQuery(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleDelete = (board: BoardWithUsers) => {
    setModalData({
      board,
      onSuccess: () =>
        fetchBoardsData(pagination.current, pagination.pageSize, searchQuery),
    });
    openModal(CONFIRM_DELETE_MODAL);
  };

  const showUsersModal = (board: BoardWithUsers) => {
    setModalData({
      board,
      onSuccess: () =>
        fetchBoardsData(pagination.current, pagination.pageSize, searchQuery),
    });
    openModal(MANAGE_USERS_MODAL);
  };

  const showAccessModal = (board: BoardWithUsers) => {
    setModalData({
      board,
      onSuccess: () =>
        fetchBoardsData(pagination.current, pagination.pageSize, searchQuery),
    });
    openModal(MANAGE_ACCESS_MODAL);
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  const handleBackBtnClick = () => {
    navigate("/");
  };

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.header}>
        <UiButton
          variant="secondary"
          className={styles.backBtn}
          onClick={handleBackBtnClick}
        >
          <Icon width={24} height={24} iconName="BackArrow" />
        </UiButton>
        <h2 className={styles.dashboardTitle}>Управление досками</h2>
      </div>

      <div className={styles.searchBar}>
        <div style={{ width: "100%" }}>
          <Input
            id="admin-board-search-input"
            placeholder="Введите ID доски для поиска"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          className={styles.searchBtn}
          onClick={handleSearch}
          pattern="tertiary"
        >
          Найти
        </Button>
        {searchTerm && (
          <Button className={styles.searchBtn} onClick={handleClearSearch}>
            Очистить
          </Button>
        )}
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.customTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Автор</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className={styles.loadingCell}>
                  Загрузка...
                </td>
              </tr>
            ) : boards.length > 0 ? (
              boards.map((board) => (
                <tr key={board.uuid}>
                  <td data-label="ID">{board.uuid}</td>
                  <td data-label="Название">{board.title}</td>
                  <td data-label="Автор">{board.author?.email || "N/A"}</td>
                  <td data-label="Статус">
                    <span
                      onClick={() => showAccessModal(board)}
                      className={clsx(
                        styles.statusTag,
                        board.isPublic
                          ? styles.statusPublic
                          : styles.statusPrivate,
                      )}
                    >
                      {board.isPublic ? "Публичная" : "Приватная"}
                    </span>
                  </td>
                  <td data-label="Действия">
                    <div className={styles.actionButtons}>
                      <Button
                        pattern="quaternary"
                        onClick={() => showUsersModal(board)}
                      >
                        Пользователи
                      </Button>
                      <Button
                        onClick={() => handleDelete(board)}
                        pattern="primary"
                      >
                        Удалить
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.noDataCell}>
                  Данные не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && pagination.total > 0 && (
        <div className={styles.pagination}>
          <Button
            className={styles.searchBtn}
            onClick={() => handlePageChange(pagination.current - 1)}
            disabled={pagination.current === 1}
          >
            Назад
          </Button>
          <span>
            Страница {pagination.current} из {totalPages}
          </span>
          <Button
            className={styles.searchBtn}
            onClick={() => handlePageChange(pagination.current + 1)}
            disabled={pagination.current === totalPages}
          >
            Вперед
          </Button>
        </div>
      )}
      <UiModalBackground>
        <ManageAccessModal />
        <ManageUsersModal />
        <ConfirmDeleteModal />
      </UiModalBackground>
    </div>
  );
};
