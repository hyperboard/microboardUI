import { Icon } from "shared/ui-lib/Icon/Icon";
import clsx from "clsx";
import React, { MouseEventHandler, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import style from "./ChangeRange.module.css";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/index";
import { Dice } from "microboard-temp";
import { useAppSubscription } from "App/useBoardSubscription";

type Props = {
	rounded?: "none" | "left";
	rangeValue: "min" | "max";
};

const getValuesFromRange = (range: { min: number; max: number }): number[] => {
	const values: number[] = [];
	for (let i = range.min; i <= range.max; i++) {
		values.push(i);
	}

	return values;
};

export function ChangeRange({
	rangeValue,
	rounded = "none",
}: Props): React.ReactElement | null {
	const { t } = useTranslation();
	const { board } = useAppContext();
	const dices = board.selection.items.list() as Dice[];
	const [range, setRange] = useState(
		dices[0]?.getRange() || { min: 0, max: 0 },
	);
	const chevronRef = useRef<HTMLSpanElement>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	useAppSubscription({
		subjects: ["items", "selectionItems", "selection"],
		observer: () => {
			setRange(dices[0]?.getRange());
		},
	});

	if (dices.some(dice => dice.getType() === "custom")) {
		return null;
	}

	const handleFocus = (ev: React.FocusEvent<HTMLInputElement>): void => {
		ev.currentTarget.select();
	};

	const handleInputClick = (ev: React.MouseEvent<HTMLInputElement>): void => {
		ev.stopPropagation();
	};

	const handleChevronClick: MouseEventHandler = event => {
		event.stopPropagation();

		if (!chevronRef.current) {
			return;
		}

		const rect = chevronRef.current.getBoundingClientRect();
		const midpoint = rect.top + rect.height / 2;
		const isBigger = event.clientY < midpoint;
		const newRange = { ...range };
		newRange[rangeValue] = isBigger
			? (newRange[rangeValue] += 1)
			: (newRange[rangeValue] -= 1);
		if (newRange.min >= newRange.max) {
			return;
		}

		dices.forEach(dice => {
			dice.setValues(getValuesFromRange(newRange));
		});
		setRange(newRange);
	};

	const handleInputChange = (
		ev: React.ChangeEvent<HTMLInputElement>,
	): void => {
		const value = Number(ev.target.value);
		if (rangeValue === "min" && value >= range.max) {
			return;
		}
		if (rangeValue === "max" && value <= range.min) {
			return;
		}
		if (!!value && value >= 1) {
			range[rangeValue] = value;

			dices.forEach(dice => {
				dice.setValues(getValuesFromRange(range));
			});
			setRange(range);
		}
	};

	return (
		<UiButton
			id="pick-dice-range"
			tooltip={`${rangeValue}`}
			tooltipPosition="top"
			className={clsx(btnStyle.contextPanelButton, style.button)}
			variant="secondary"
			rounded={rounded}
		>
			<div className={style.fontSize}>
				<input
					ref={inputRef}
					id="pick-dice-range-input"
					className={style.input}
					onClick={handleInputClick}
					onChange={handleInputChange}
					onFocus={handleFocus}
					onKeyDown={ev => ev.stopPropagation()}
					value={range[rangeValue]}
					maxLength={2}
				/>
			</div>
			<span
				ref={chevronRef}
				onClick={handleChevronClick}
				className={style.chevron}
				id="FontSizeChevron"
			>
				<Icon width={20} height={20} iconName="Chevron" />
			</span>
		</UiButton>
	);
}
