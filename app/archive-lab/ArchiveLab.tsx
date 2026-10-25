"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from "react";
import { tarotCards, type Lang, type TarotCard } from "../tarot-data";
import styles from "./ArchiveLab.module.css";

type Filter = "all" | TarotCard["group"];
type Orientation = "upright" | "reversed";

const filters: Array<{ key: Filter; zh: string; en: string }> = [
  { key: "all", zh: "全部", en: "ALL" },
  { key: "major", zh: "大阿卡纳", en: "MAJOR" },
  { key: "fragments", zh: "光像组", en: "FRAGMENTS" },
  { key: "rings", zh: "同步组", en: "RINGS" },
  { key: "rifts", zh: "裂隙组", en: "RIFTS" },
  { key: "vessels", zh: "载体组", en: "VESSELS" },
  { key: "vacancy", zh: "空位", en: "VACANCY" },
];

const t = (value: { zh: string; en: string }, lang: Lang) => value[lang];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function ArchiveArt({ card, orientation, compact = false }: { card: TarotCard; orientation: Orientation; compact?: boolean }) {
  if (card.group === "vacancy") {
    return <span className={styles.vacancy} aria-label="The Vacancy"><i>∅</i></span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={card.image}
      alt={compact ? "" : card.name.zh}
      draggable={false}
      className={orientation === "reversed" ? styles.reversedArt : undefined}
    />
  );
}

export default function ArchiveLab() {
  const [lang, setLang] = useState<Lang>("zh");
  const [filter, setFilter] = useState<Filter>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [orientation, setOrientation] = useState<Orientation>("upright");
  const [dragOffset, setDragOffset] = useState(0);
  const pointerStartRef = useRef<{ pointerId: number; y: number } | null>(null);
  const wheelAccumulatorRef = useRef(0);
  const wheelGestureConsumedRef = useRef(false);
  const wheelConsumedAtRef = useRef(0);
  const wheelLastDeltaRef = useRef(0);
  const wheelLastEventAtRef = useRef(0);
  const wheelResetTimerRef = useRef<number | null>(null);

  const cards = useMemo(
    () => (filter === "all" ? tarotCards : tarotCards.filter((card) => card.group === filter)),
    [filter],
  );
  const activeCard = cards[activeIndex] ?? cards[0];

  useEffect(() => {
    setActiveIndex(0);
    setOrientation("upright");
    wheelAccumulatorRef.current = 0;
    wheelGestureConsumedRef.current = false;
    wheelConsumedAtRef.current = 0;
    wheelLastDeltaRef.current = 0;
    wheelLastEventAtRef.current = 0;
  }, [filter]);

  useEffect(() => () => {
    if (wheelResetTimerRef.current !== null) {
      window.clearTimeout(wheelResetTimerRef.current);
    }
  }, []);

  const move = useCallback((direction: -1 | 1) => {
    setActiveIndex((current) => clamp(current + direction, 0, Math.max(cards.length - 1, 0)));
  }, [cards.length]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 0.01) return;

    const now = performance.now();
    const direction = event.deltaY > 0 ? 1 : -1;
    const previousDelta = wheelLastDeltaRef.current;
    const eventGap = now - wheelLastEventAtRef.current;
    const changedDirection = previousDelta !== 0 && Math.sign(event.deltaY) !== Math.sign(previousDelta);
    const freshImpulse = wheelGestureConsumedRef.current
      && now - wheelConsumedAtRef.current > 180
      && Math.abs(event.deltaY) >= 7
      && Math.abs(event.deltaY) > Math.abs(previousDelta) * 1.45;

    if (eventGap > 110 || changedDirection || freshImpulse) {
      wheelAccumulatorRef.current = 0;
      wheelGestureConsumedRef.current = false;
    }

    wheelLastDeltaRef.current = event.deltaY;
    wheelLastEventAtRef.current = now;

    const atStart = activeIndex === 0 && direction < 0;
    const atEnd = activeIndex === cards.length - 1 && direction > 0;
    if (!wheelGestureConsumedRef.current && (atStart || atEnd)) return;

    event.preventDefault();
    wheelAccumulatorRef.current += event.deltaY;

    if (wheelResetTimerRef.current !== null) {
      window.clearTimeout(wheelResetTimerRef.current);
    }
    wheelResetTimerRef.current = window.setTimeout(() => {
      wheelAccumulatorRef.current = 0;
      wheelGestureConsumedRef.current = false;
      wheelLastDeltaRef.current = 0;
      wheelLastEventAtRef.current = 0;
      wheelResetTimerRef.current = null;
    }, 110);

    if (wheelGestureConsumedRef.current || Math.abs(wheelAccumulatorRef.current) < 48) return;

    move(wheelAccumulatorRef.current > 0 ? 1 : -1);
    wheelGestureConsumedRef.current = true;
    wheelConsumedAtRef.current = now;
    wheelAccumulatorRef.current = 0;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { pointerId: event.pointerId, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    setDragOffset(clamp(event.clientY - start.y, -120, 120));
  };

  const finishPointer = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    if (Math.abs(dragOffset) > 38) move(dragOffset < 0 ? 1 : -1);
    pointerStartRef.current = null;
    setDragOffset(0);
  };

  const handleRailKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
  };

  const visibleCards = cards
    .map((card, index) => ({ card, index, offset: index - activeIndex }))
    .filter(({ offset }) => Math.abs(offset) <= 4);

  if (!activeCard) return null;

  return (
    <main className={styles.page}>
      <div className={styles.rotateGate} role="dialog" aria-modal="true" aria-labelledby="rotate-gate-title">
        <div className={styles.rotateGateContent}>
          <span>ORIENTATION REQUIRED / 90°</span>
          <div className={styles.rotateDevice} aria-hidden="true"><i /></div>
          <h1 id="rotate-gate-title">{lang === "zh" ? "请将手机横置" : "ROTATE YOUR PHONE"}</h1>
          <p>{lang === "zh" ? "横屏后将自动进入牌库" : "The archive will open automatically in landscape."}</p>
        </div>
      </div>
      <header className={styles.topbar}>
        <div className={styles.labTitle}>
          <span><i />ARCHIVE INTERFACE / LAB—01</span>
          <b>{lang === "zh" ? "横屏牌库交互实验" : "LANDSCAPE ARCHIVE LAB"}</b>
        </div>
        <div className={styles.topActions}>
          <span className={styles.counter}>{String(activeIndex + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span>
          <div className={styles.language} aria-label="Language">
            <button className={lang === "zh" ? styles.active : undefined} onClick={() => setLang("zh")}>中</button>
            <i>/</i>
            <button className={lang === "en" ? styles.active : undefined} onClick={() => setLang("en")}>EN</button>
          </div>
          <Link href="/">{lang === "zh" ? "返回主站" : "BACK TO MAIN"}<i>↗</i></Link>
        </div>
      </header>

      <section className={styles.stage}>
        <div className={styles.cardColumn}>
          <div className={styles.cardIndex}><span>{activeCard.number}</span><i /></div>
          <div
            key={activeCard.id}
            className={`${styles.mainCard} ${orientation === "upright" ? styles.upright : styles.reversed}`}
          >
            <div className={styles.mainCardInner}>
              <ArchiveArt card={activeCard} orientation={orientation} />
            </div>
          </div>
          {activeCard.group !== "vacancy" ? (
            <div className={styles.orientation} role="group" aria-label={lang === "zh" ? "牌面方向" : "Card orientation"}>
              <button className={orientation === "upright" ? styles.active : undefined} onClick={() => setOrientation("upright")}>
                <span>{lang === "zh" ? "正位" : "UPRIGHT"}</span><i>·</i><span>{lang === "zh" ? "见日态" : "SUNLIT"}</span>
              </button>
              <button className={orientation === "reversed" ? styles.active : undefined} onClick={() => setOrientation("reversed")}>
                <span>{lang === "zh" ? "逆位" : "REVERSED"}</span><i>·</i><span>{lang === "zh" ? "失锚态" : "UNANCHORED"}</span>
              </button>
            </div>
          ) : <p className={styles.vacancyState}>{lang === "zh" ? "空位没有正逆位" : "THE VACANCY HAS NO ORIENTATION"}</p>}
        </div>

        <article key={`${activeCard.id}-copy`} className={styles.copyColumn}>
          <p className={styles.kicker}>{t(activeCard.groupName, lang)} / {activeCard.group.toUpperCase()}</p>
          <h1>{t(activeCard.name, lang)}</h1>
          <p className={styles.englishName}>{lang === "zh" ? activeCard.name.en : activeCard.name.zh}</p>
          <div className={styles.rule}><span /></div>
          <section>
            <h2>{lang === "zh" ? "档案释义" : "ARCHIVE MEANING"}</h2>
            <p>{t(activeCard.archive, lang)}</p>
          </section>
          <section className={`${styles.stateMeaning} ${orientation === "upright" ? styles.sunlit : styles.unanchored}`}>
            <h2>{activeCard.group === "vacancy" ? (lang === "zh" ? "空位" : "VACANCY") : orientation === "upright" ? (lang === "zh" ? "见日态" : "SUNLIT STATE") : (lang === "zh" ? "失锚态" : "UNANCHORED STATE")}</h2>
            <p>{t(activeCard.group === "vacancy" || orientation === "upright" ? activeCard.upright : activeCard.reversed, lang)}</p>
          </section>
          <dl>
            <div><dt>{lang === "zh" ? "关键词" : "KEYWORDS"}</dt><dd>{t(activeCard.keywords, lang)}</dd></div>
            <div><dt>{lang === "zh" ? "继续追问" : "CORE QUESTION"}</dt><dd>{t(activeCard.question, lang)}</dd></div>
          </dl>
        </article>

        <div className={styles.railColumn}>
          <div className={styles.railHeader}>
            <span>{lang === "zh" ? "在右侧上下滑动" : "SWIPE VERTICALLY"}</span>
            <i>↕</i>
          </div>
          <div
            className={styles.rail}
            role="listbox"
            aria-label={lang === "zh" ? "卡牌选择" : "Card selector"}
            aria-activedescendant={`lab-card-${activeCard.id}`}
            tabIndex={0}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointer}
            onPointerCancel={finishPointer}
            onKeyDown={handleRailKey}
          >
            <div className={styles.orbit} aria-hidden="true"><i /><i /><i /></div>
            {visibleCards.map(({ card, index, offset }) => {
              const depth = Math.abs(offset);
              const style = {
                "--rail-y": `${offset * 27 + dragOffset * 0.11}vh`,
                "--rail-x": `${depth * 42 + (offset > 0 ? 12 : 0)}px`,
                "--rail-z": `${-depth * 170}px`,
                "--rail-yaw": `${-27 - depth * 6.5}deg`,
                "--rail-pitch": `${offset * -4.5}deg`,
                "--rail-rotate": `${-4 + offset * 2.8}deg`,
                "--rail-scale": Math.max(0.76, 1.03 - depth * 0.045),
                "--rail-opacity": Math.max(0.28, 1 - depth * 0.14),
                zIndex: 20 - depth,
              } as CSSProperties;
              return (
                <button
                  key={card.id}
                  id={`lab-card-${card.id}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`${styles.railCard} ${index === activeIndex ? styles.selected : ""}`}
                  style={style}
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveIndex(index);
                    setOrientation("upright");
                  }}
                >
                  <ArchiveArt card={card} orientation="upright" compact />
                  <span><b>{card.number}</b>{t(card.name, lang)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <nav className={styles.filters} aria-label={lang === "zh" ? "牌组筛选" : "Deck filters"}>
        <span>FILTER / DECK</span>
        <div>
          {filters.map((item) => (
            <button key={item.key} className={filter === item.key ? styles.active : undefined} onClick={() => setFilter(item.key)}>
              {lang === "zh" ? item.zh : item.en}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
