import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppContext } from "features/AppContext";
import styles from "./AudioPlayer.module.css";
import { Mbr, AudioItem } from "microboard-temp";
import { Icon } from "shared/ui-lib/Icon/Icon";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import clsx from "clsx";
import { useClickOutside } from "shared/lib/useClickOutside";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { useAccount } from "App/useAccount";
import { useResolveRedirectUrl } from "shared/lib/useResolveRedirectUrl";

interface Props {
  item: AudioItem;
}

const PLAYBACK_RATES = [
  "0.25",
  "0.5",
  "0.75",
  "Normal",
  "1.25",
  "1.5",
  "1.75",
  "2",
];

type OpenedMenu = "playbackRate" | "volume" | "extraOptions" | "none";

export function secondsToHumanReadable(seconds: number): string {
  if (seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

export const AudioPlayer = ({ item }: Props) => {
  const { board } = useAppContext();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRateIndex, setPlaybackRateIndex] = useState(3);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [isVolumeBarDown, setIsVolumeBarDown] = useState(false);
  const [isProgressBarDown, setIsProgressBarDown] = useState(false);
  const [openedMenu, setOpenedMenu] = useState<OpenedMenu>("none");
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const extraOptionsBtnRef = useRef<HTMLDivElement>(null);
  const playbackRateBtnRef = useRef<HTMLDivElement>(null);
  const volumeBtnRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const account = useAccount();

  const optionsRef = useClickOutside(
    () => setOpenedMenu("none"),
    [extraOptionsBtnRef, playbackRateBtnRef],
    true,
  );

  const { resolvedUrl, isLoadingUrl } = useResolveRedirectUrl({
    mediaUrl: item.getUrl(),
    accessToken: account.accessToken,
    beforeStartCb: () => setIsMetadataLoaded(false),
  });

  const isPlaying = item.getIsPlaying();
  const isDisabled = isLoadingUrl || !isMetadataLoaded || !resolvedUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleLoadedMetadata = () => {
      audio.currentTime = item.getCurrentTime();
      setIsMetadataLoaded(true);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata,
        );
      }
    };
  }, []);

  const onProgressBarMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    const audio = audioRef.current;

    if (!progressBar || !audio || !isProgressBarDown) {
      return;
    }

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const currentTime = pos * duration > duration ? duration : pos * duration;
    audio.currentTime = currentTime;
    setCurrentTime(currentTime);
    clearBoardSelection();
  };

  const onVolumeBarMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const volumeBar = volumeBarRef.current;
    const audio = audioRef.current;

    if (!volumeBar || !audio || !isVolumeBarDown) {
      return;
    }

    const rect = volumeBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const volume = pos > 1 ? 1 : pos < 0 ? 0 : pos;
    audio.volume = volume;
    setVolume(volume);
  };

  const handlePlaybackRateChange = (playbackRateIndex: number) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    toggleOpenedMenu("none");
    audio.playbackRate = (playbackRateIndex + 1) * 0.25;
    setPlaybackRateIndex(playbackRateIndex);
  };

  const toggleOpenedMenu = (menuName: OpenedMenu) => {
    if (menuName === openedMenu) {
      setOpenedMenu("none");
    } else {
      setOpenedMenu(menuName);
    }
  };

  const onEnded = () => {
    if (isProgressBarDown) {
      return;
    }
    item.setCurrentTime(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    item.setIsPlaying(false);
  };

  const onProgress = () => {
    if (!audioRef.current) {
      return;
    }
    if (audioRef.current.buffered.length > 0) {
      setBufferedTime(
        audioRef.current.buffered.end(audioRef.current.buffered.length - 1),
      );
    }
  };

  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  };

  const onLoadedData = () => {
    setDuration(audioRef.current?.duration || 0);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        item.setCurrentTime(audioRef.current.currentTime);
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      item.setIsPlaying(!isPlaying);
    }
  };

  const onDownloadClick = (): void => {
    item.download();
    toggleOpenedMenu("none");
  };

  const clearBoardSelection = () => {
    board.tools.leftButtonUp();
    board.selection.removeAll();
  };

  const getVolumeDropdownPosition = (): CSSProperties | undefined => {
    const volume = volumeBtnRef.current;
    if (!volume) {
      return undefined;
    }

    const { bottom, left, width } = volume.getBoundingClientRect();
    return { top: `${bottom}px`, left: `${left + width / 2 - 42}px` };
  };

  const getOptionsDropdownPosition = (): CSSProperties | undefined => {
    const options = extraOptionsBtnRef.current;
    if (!options) {
      return undefined;
    }

    const { bottom, right } = options.getBoundingClientRect();
    return { top: `${bottom}px`, right: `${window.innerWidth - right}px` };
  };

  const audioMbr = item.getMbr();
  const mbr = new Mbr(
    audioMbr.left,
    audioMbr.top,
    audioMbr.right,
    audioMbr.bottom,
  ).getTransformed(board.camera.getMatrix());

  return (
    <div
      className={styles.container}
      style={{
        width: "368px",
        height: "76px",
        left: mbr.left,
        top: mbr.top,
        zIndex: board.getZIndex(item),
        transform: `scale(${item.transformation.getScale().x * board.camera.getScale()})`,
        transformOrigin: "top left",
      }}
      ref={containerRef}
    >
      <div className={styles.movementBar}></div>
      <audio
        ref={audioRef}
        className={styles.displayNone}
        src={resolvedUrl || ""}
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
        onLoadedData={onLoadedData}
        onProgress={onProgress}
      />

      <div className={styles.controls}>
        <button
          className={clsx(
            styles.playPauseButton,
            isDisabled && styles.disabledBackground,
          )}
          onClick={() => {
            if (!isDisabled) {
              togglePlay();
              clearBoardSelection();
            }
          }}
        >
          <Icon
            className={clsx(isDisabled && styles.disabledColor)}
            iconName={isPlaying ? "Pause" : "Play"}
            width={16}
            height={16}
          />
        </button>

        <div className={styles.timeControls}>
          <span
            className={clsx(
              styles.duration,
              isDisabled && styles.disabledColor,
            )}
          >
            {secondsToHumanReadable(currentTime)} /{" "}
            {secondsToHumanReadable(duration)}
          </span>
          <div
            ref={progressBarRef}
            className={styles.barContainer}
            onMouseMove={(event) => {
              onProgressBarMove(event);
            }}
            onMouseDown={() => {
              if (!isDisabled) {
                setIsProgressBarDown(true);
                clearBoardSelection();
              }
            }}
            onMouseUp={(event) => {
              setIsProgressBarDown(false);
              onProgressBarMove(event);
            }}
            onMouseLeave={(event) => {
              setIsProgressBarDown(false);
              onProgressBarMove(event);
            }}
          >
            <div className={styles.progressBarContainer}>
              <div
                className={styles.bufferedProgressBar}
                style={{
                  width: `${(bufferedTime / duration) * 100 || 0}%`,
                }}
              />
              <div
                className={styles.progressBar}
                style={{
                  width: `${(currentTime / duration) * 100 || 0}%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className={styles.controls} ref={optionsRef}>
          <div ref={volumeBtnRef} className={styles.dropdown}>
            <button
              className={styles.controlsBtn}
              onClick={() => {
                if (!isDisabled) {
                  toggleOpenedMenu("volume");
                  clearBoardSelection();
                }
              }}
            >
              <Icon
                className={clsx(isDisabled && styles.disabledColor)}
                iconName="Volume"
                width={16}
                height={16}
              />
            </button>
            {openedMenu === "volume" && (
              <Dropdown
                className={clsx(styles.dropdownMenu, styles.volumeBarMenu)}
                style={getVolumeDropdownPosition()}
              >
                <div
                  ref={volumeBarRef}
                  style={{
                    width: "100%",
                    flex: "none",
                  }}
                  onMouseDown={() => setIsVolumeBarDown(true)}
                  onMouseUp={(event) => {
                    setIsVolumeBarDown(false);
                    onVolumeBarMove(event);
                  }}
                  onMouseLeave={(event) => {
                    setIsVolumeBarDown(false);
                    onVolumeBarMove(event);
                  }}
                  onMouseMove={onVolumeBarMove}
                  className={styles.barContainer}
                >
                  <div className={styles.volumeBarContainer}>
                    <div
                      className={styles.volumeBar}
                      style={{
                        width: `${volume * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </Dropdown>
            )}
          </div>
          <div ref={extraOptionsBtnRef} className={styles.dropdown}>
            <button
              className={styles.controlsBtn}
              onClick={() => {
                if (!isDisabled) {
                  toggleOpenedMenu("extraOptions");
                  clearBoardSelection();
                }
              }}
            >
              <Icon
                className={clsx(isDisabled && styles.disabledColor)}
                iconName="Dots"
                width={16}
                height={16}
              />
            </button>
            {openedMenu === "extraOptions" && (
              <Dropdown
                padding={6}
                className={clsx(styles.dropdownMenu, styles.extraOptionsMenu)}
                style={getOptionsDropdownPosition()}
              >
                <div ref={playbackRateBtnRef}>
                  <button
                    onClick={onDownloadClick}
                    className={styles.dropdownButton}
                  >
                    <Icon iconName="Download" width={20} height={20} />
                    {t("audio.download")}
                  </button>
                  <button
                    onClick={() =>
                      setTimeout(() => toggleOpenedMenu("playbackRate"))
                    }
                    className={styles.dropdownButton}
                  >
                    <Icon iconName="PlaybackRate" width={20} height={20} />
                    {t("audio.playbackRate")}
                  </button>
                </div>
              </Dropdown>
            )}
            {openedMenu === "playbackRate" && (
              <Dropdown
                padding={6}
                className={clsx(styles.dropdownMenu, styles.extraOptionsMenu)}
                style={getOptionsDropdownPosition()}
              >
                <div
                  onWheelCapture={(event) => event.stopPropagation()}
                  className={styles.scrollContainer}
                >
                  {PLAYBACK_RATES.map((rate, index) => {
                    return (
                      <button
                        key={rate}
                        className={clsx(
                          styles.dropdownButton,
                          styles.paybackRateBtn,
                        )}
                        onClick={() => handlePlaybackRateChange(index)}
                      >
                        {rate}
                        {index === playbackRateIndex && (
                          <Icon iconName="checkMark" width={20} height={20} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DropdownProps {
  children: ReactNode;
  padding?: number;
  style?: CSSProperties;
  className?: string;
}

const Dropdown = ({ children, className, style, padding }: DropdownProps) => {
  return createPortal(
    <UiPanel
      padding={padding}
      vertical={true}
      style={style}
      className={className}
    >
      {children}
    </UiPanel>,
    document.body,
  );
};
