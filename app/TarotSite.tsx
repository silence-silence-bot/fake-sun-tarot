"use client";

import Link from "next/link";
import { CSSProperties, FormEvent, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Lang, Localized, TarotCard, tarotCards } from "./tarot-data";
import interpretationEngine from "./interpretation-engine.json";
import { assetPath } from "./asset-path";

type Orientation = "upright" | "reversed" | "none";
type DrawnCard = { card: TarotCard; orientation: Orientation };
type View = "draw" | "interpret" | "library";
type SpreadKey = "twin" | "three" | "pentagram";
type SpreadPosition = { name: Localized; function: Localized; question: Localized };
type EngineSuit = keyof typeof interpretationEngine.suits;
type EngineRank = keyof typeof interpretationEngine.ranks;
type EngineCourtRole = keyof typeof interpretationEngine.courtRanks;
type AgentStatus = "idle" | "processing" | "ready";
type MockAgentReading = {
  questionCalibration: { summary: string; hiddenAssumption?: string };
  positionReadings: Array<{ positionIndex: number; headline: string; interpretation: string; evidence: string[] }>;
  relationships: Array<{ type: "support" | "tension" | "progression" | "cost" | "projection"; positions: number[]; interpretation: string }>;
  systemDiagnosis: { level: "normal" | "drift" | "eclipse" | "vacancy"; headline: string; interpretation: string };
  synthesis: { directAnswer: string; keyFinding: string; uncertainty: string };
  action: { nextStep: string; verification: string };
  followUpQuestions: string[];
  disclaimer: string;
};

const engineRanks: EngineRank[] = ["ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const engineCourtRoles: Record<string, EngineCourtRole> = {
  M: "messenger",
  N: "voyager",
  C: "calibrator",
  S: "sunbearer",
};
const engineStageEn: Record<EngineRank, string> = {
  ace: "Emergence",
  two: "Differentiation",
  three: "Connection",
  four: "Stabilization",
  five: "Disruption",
  six: "Reorganization",
  seven: "Testing",
  eight: "Self-operation",
  nine: "Individual outcome",
  ten: "Systemic outcome",
};
const engineDomainEn: Record<EngineSuit, string> = {
  fragments: "direction, intention, creation, belief, and action",
  rings: "emotion, relationship, belonging, and consensus",
  rifts: "thought, evidence, conflict, language, and truth",
  vessels: "body, resources, labor, and material conditions",
};
const cardGroupHelp: Record<TarotCard["group"], Localized> = {
  major: { zh: "大阿卡纳记录影响共同现实的文明结构与系统级转变。", en: "Major Arcana record civilizational structures and system-level shifts that shape shared reality." },
  fragments: { zh: "光像组关注方向、意愿、创造、信念与行动。", en: "Fragments concern direction, intention, creation, belief, and action." },
  rings: { zh: "同步组关注情感、关系、归属与共识。", en: "Rings concern emotion, relationship, belonging, and consensus." },
  rifts: { zh: "裂隙组关注思想、证据、冲突、语言与真相。", en: "Rifts concern thought, evidence, conflict, language, and truth." },
  vessels: { zh: "载体组关注身体、资源、劳动与物质条件。", en: "Vessels concern bodies, resources, labor, and material conditions." },
  vacancy: { zh: "空位不属于任何卡组，表示一个被错放在中心的未证实假设。", en: "The Vacancy belongs to no group and marks an unverified assumption placed at the center." },
};

const spreads: Record<SpreadKey, {
  title: Localized;
  subtitle: Localized;
  count: number;
  positions: SpreadPosition[];
}> = {
  twin: {
    title: { zh: "双日牌阵", en: "Twin Suns" },
    subtitle: { zh: "得到与付出", en: "What you receive and what you give" },
    count: 2,
    positions: [
      {
        name: { zh: "得到", en: "Receive" },
        function: { zh: "获得的实际价值", en: "The real value received" },
        question: { zh: "它给我什么？", en: "What does it give me?" },
      },
      {
        name: { zh: "付出", en: "Give" },
        function: { zh: "需要承担的代价", en: "The cost that must be carried" },
        question: { zh: "我要为此付出什么？", en: "What must I give for it?" },
      },
    ],
  },
  three: {
    title: { zh: "三日牌阵", en: "Three Suns" },
    subtitle: { zh: "观察支撑、裂缝与重新显现", en: "Read support, fracture, and reappearance" },
    count: 3,
    positions: [
      {
        name: { zh: "支撑", en: "Support" },
        function: { zh: "当前现实仍能运转的实际条件", en: "The material condition keeping this reality operational" },
        question: { zh: "此刻究竟是什么在托住局面？", en: "What is actually holding the situation up?" },
      },
      {
        name: { zh: "裂隙", en: "Rift" },
        function: { zh: "解释与现实开始分离的位置", en: "Where explanation begins to separate from reality" },
        question: { zh: "哪个矛盾已经不能继续被当作误差？", en: "Which contradiction can no longer be dismissed as error?" },
      },
      {
        name: { zh: "再显", en: "Reappearance" },
        function: { zh: "旧解释松动后重新可见的可能", en: "What becomes visible as the old explanation loosens" },
        question: { zh: "当中心退场，什么正在重新出现？", en: "What reappears when the center recedes?" },
      },
    ],
  },
  pentagram: {
    title: { zh: "伪日五芒", en: "Fake Sun Pentagram" },
    subtitle: { zh: "以五层检查读取完整机制", en: "Read the mechanism through five layers" },
    count: 5,
    positions: [
      {
        name: { zh: "光", en: "Light" },
        function: { zh: "这件事真正提供的功能", en: "The function this truly provides" },
        question: { zh: "它确实给了我什么好东西？", en: "What good thing has it genuinely given me?" },
      },
      {
        name: { zh: "投影", en: "Projection" },
        function: { zh: "你附加在它身上的期待与解释", en: "The expectation and explanation you place upon it" },
        question: { zh: "你附加给它的，本来不属于它的希望是什么？", en: "What hope did you attach to it that never belonged to it?" },
      },
      {
        name: { zh: "校准体", en: "Calibrator" },
        function: { zh: "维持这套现实所需要承担的隐性成本", en: "The hidden cost required to maintain this reality" },
        question: { zh: "到底是谁一直在辛苦兜底？", en: "Who has been doing the unseen work of holding it together?" },
      },
      {
        name: { zh: "失锚", en: "Unanchoring" },
        function: { zh: "停止相信或退出之后，最先失去的东西", en: "What is lost first after belief stops or you leave" },
        question: { zh: "我为什么不敢放弃它？", en: "Why am I afraid to let it go?" },
      },
      {
        name: { zh: "余晖", en: "Afterglow" },
        function: { zh: "中心解释消失后仍然存在的真实价值", en: "The real value remaining after the central explanation disappears" },
        question: { zh: "就算我不选它，我还剩下什么？", en: "Even if I do not choose it, what remains?" },
      },
    ],
  },
};

const spreadGuides: Record<SpreadKey, Localized> = {
  twin: { zh: "双日牌阵｜快速判断", en: "TWIN SUNS | QUICK CHECK" },
  three: { zh: "三日牌阵｜日常解读", en: "THREE SUNS | DAILY READING" },
  pentagram: { zh: "伪日五芒｜深入拆解", en: "FAKE SUN PENTAGRAM | DEEP ANALYSIS" },
};

const ui = {
  navDraw: { zh: "抽牌", en: "Draw" },
  navInterpret: { zh: "解读", en: "Reading" },
  navLibrary: { zh: "牌库", en: "Archive" },
  heroCopy: { zh: "辨认相信维持了什么，以及谁在承担代价。", en: "See what belief sustains—and who bears its cost." },
  questionStep: { zh: "01 / 提出问题", en: "01 / FORMULATE A QUESTION" },
  questionPrompt: { zh: "请提出一个具体、与你有关的问题。", en: "Ask a specific question that concerns you directly." },
  questionGuidance: { zh: "比起“会不会”，更适合问：", en: "Instead of asking whether something will happen, try:" },
  questionExamples: {
    zh: ["“关于某事，我该如何理解？”", "“关于某事，我需要注意什么？”", "“关于某事，下一步怎么做？”"],
    en: ["“How should I understand this?”", "“What should I pay attention to?”", "“What should I do next?”"],
  },
  questionLabel: { zh: "你的问题", en: "YOUR QUESTION" },
  questionPlaceholder: { zh: "关于……，我需要注意什么？", en: "Regarding..., what should I pay attention to?" },
  submitQuestion: { zh: "确认问题", en: "CONFIRM QUESTION" },
  currentQuestion: { zh: "本次提问", en: "CURRENT QUESTION" },
  reenterQuestion: { zh: "重新输入", en: "EDIT QUESTION" },
  chooseSpread: { zh: "02 / 选择牌阵", en: "02 / SELECT A SPREAD" },
  draw: { zh: "抽牌", en: "DRAW CARDS" },
  reveal: { zh: "揭示", en: "REVEAL CARDS" },
  viewReading: { zh: "查看解读", en: "VIEW READING" },
  redraw: { zh: "重新抽取", en: "DRAW AGAIN" },
  waiting: { zh: "等待一次观测", en: "AWAITING OBSERVATION" },
  waitingCopy: { zh: "选择一个牌阵，然后开始校准。牌面会依次翻开，普通牌的正逆位随机确定；空位牌没有方向。", en: "Choose a spread and begin calibration. Ordinary cards receive a random orientation; The Vacancy has none." },
  readTitle: { zh: "03 / 本次解读", en: "03 / CURRENT READING" },
  noReading: { zh: "尚未建立观测记录", en: "NO OBSERVATION RECORDED" },
  noReadingCopy: { zh: "完成一次抽牌后，这里会显示逐位解读、日蚀警报与共识偏移。", en: "Complete a draw to see positional readings, eclipse alerts, and consensus drift." },
  awaitingReveal: { zh: "卡面尚未翻开", en: "CARDS AWAIT REVEAL" },
  awaitingRevealCopy: { zh: "牌已经进入对应位置。点击“揭示”后，才会显示牌名、正逆位与完整解读。", en: "The cards are in position. Choose Reveal Cards to show their names, orientations, and full reading." },
  eclipse: { zh: "日蚀触发", en: "ECLIPSE TRIGGERED" },
  eclipseCopy: { zh: "表面的解释已经遮蔽实际运行机制。请额外追问：谁从当前解释中受益？谁承担不可见成本？有没有比揭穿更温和的修正？", en: "The surface explanation is obscuring the operating mechanism. Ask: who benefits, who carries the unseen cost, and whether a gentler correction exists than exposure alone." },
  drift: { zh: "共识偏移", en: "CONSENSUS DRIFT" },
  vacancyAlert: { zh: "空位出现｜中心假设未证实", en: "VACANCY DETECTED / CENTER UNVERIFIED" },
  vacancyAlertCopy: { zh: "问题里藏着一个尚未被证实、且可能并不成立的中心假设。先暂停沿用当前前提，重新确认：被放在中心的东西真的成立吗？", en: "The question contains a central assumption that remains unverified and may not hold. Pause the current premise and ask: does what has been placed at the center actually hold?" },
  upright: { zh: "正位 · 见日态", en: "UPRIGHT · ANCHORED" },
  reversed: { zh: "逆位 · 失锚态", en: "REVERSED · UNANCHORED" },
  uprightHelp: { zh: "这张牌的力量正在正常发挥。", en: "This card's power is operating normally." },
  reversedHelp: { zh: "这张牌的力量仍在发挥，但有受阻、过度或发生偏移。", en: "This card's power is still active, but it may be obstructed, excessive, or drifting." },
  viewArchive: { zh: "查看完整档案", en: "OPEN FULL ARCHIVE" },
  libraryTitle: { zh: "牌库档案", en: "THE CARD ARCHIVE" },
  libraryCopy: { zh: "22 张大阿卡纳记录文明结构，56 张小阿卡纳记录普通人的共同太阳，第 79 张“空位”记录一个被错放在中心的未证实假设。", en: "Twenty-two Major Arcana record civilizational structures, fifty-six Minor Arcana record ordinary life beneath the common sun, and the seventy-ninth card—The Vacancy—records an unverified assumption placed at the center." },
  search: { zh: "搜索牌名或关键词", en: "Search cards or keywords" },
  all: { zh: "全部 79", en: "All 79" },
  major: { zh: "大阿卡纳 22", en: "Major 22" },
  fragments: { zh: "光像组 14", en: "Fragments 14" },
  rings: { zh: "同步组 14", en: "Rings 14" },
  rifts: { zh: "裂隙组 14", en: "Rifts 14" },
  vessels: { zh: "载体组 14", en: "Vessels 14" },
  vacancy: { zh: "空位 1", en: "Vacancy 1" },
  archivePending: { zh: "档案图待制作", en: "ARTWORK PENDING" },
  archiveNumber: { zh: "档案编号", en: "ARCHIVE ID" },
  meaning: { zh: "文明切片", en: "CIVILIZATIONAL SLICE" },
  keywords: { zh: "观测关键词", en: "OBSERVATION KEYS" },
  coreQuestion: { zh: "核心提问", en: "CORE QUESTION" },
  vacancyMeaning: { zh: "抽取含义", en: "DRAW MEANING" },
  close: { zh: "关闭档案", en: "Close archive" },
  footer: { zh: "正确测量，错误归因。", en: "Correct measurement. False attribution." },
  footerNote: { zh: "伪日塔罗不是裁决真伪，而是辨认相信维持了什么，以及谁在承担代价。", en: "Fake Sun Tarot does not judge truth or falsehood. It identifies what belief maintains, and who carries the cost." },
};

const agentUi = {
  title: { zh: "综合观测智能体", en: "SYNTHESIS AGENT" },
  ready: { zh: "等待生成", en: "READY" },
  processing: { zh: "正在观测", en: "PROCESSING" },
  complete: { zh: "观测完成", en: "COMPLETE" },
  localDemo: { zh: "本地结构演示", en: "LOCAL STRUCTURE DEMO" },
  intro: { zh: "结合你的问题、牌阵位置、卡牌状态与系统诊断，生成一次针对本次抽牌的综合解析。", en: "Combine your question, spread positions, card states, and diagnostics into one reading for this draw." },
  generate: { zh: "生成智能解析", en: "GENERATE SYNTHESIS" },
  needsQuestion: { zh: "请先提交问题", en: "SUBMIT A QUESTION FIRST" },
  demoNote: { zh: "当前为本地模拟结果，用于确认界面与阅读结构；尚未连接真实 AI。", en: "This local simulation previews the interface and reading structure; no live AI is connected yet." },
  calibration: { zh: "问题校准", en: "QUESTION CALIBRATION" },
  synthesis: { zh: "综合观测", en: "SYNTHESIS" },
  positions: { zh: "逐位解析", en: "POSITION READINGS" },
  relations: { zh: "信号关系", en: "SIGNAL RELATIONSHIPS" },
  diagnosis: { zh: "系统诊断", en: "SYSTEM DIAGNOSIS" },
  action: { zh: "下一步行动", en: "NEXT ACTION" },
  followUp: { zh: "继续追问", en: "CONTINUE INQUIRY" },
  evidence: { zh: "依据", en: "EVIDENCE" },
  verify: { zh: "验证方式", en: "VERIFY" },
  regenerate: { zh: "重新生成", en: "GENERATE AGAIN" },
  steps: {
    zh: ["校准问题", "读取位置", "比对信号", "生成综合观测"],
    en: ["Calibrate question", "Read positions", "Compare signals", "Compose synthesis"],
  },
};

const diagnosticGroups: Array<{ key: TarotCard["group"]; label: Localized }> = [
  { key: "major", label: { zh: "大阿卡纳", en: "MAJOR ARCANA" } },
  { key: "fragments", label: { zh: "光像组", en: "FRAGMENTS" } },
  { key: "rings", label: { zh: "同步组", en: "RINGS" } },
  { key: "rifts", label: { zh: "裂隙组", en: "RIFTS" } },
  { key: "vessels", label: { zh: "载体组", en: "VESSELS" } },
  { key: "vacancy", label: { zh: "空位", en: "VACANCY" } },
];

function local(value: Localized, lang: Lang) {
  return value[lang];
}

function isVacancy(card: TarotCard) {
  return card.group === "vacancy";
}

function archiveCode(card: TarotCard) {
  return isVacancy(card) ? "∅" : card.number.padStart(2, "0");
}

function OrientationTag({ orientation, lang, context, tooltipId }: { orientation: Orientation; lang: Lang; context: "draw" | "reading"; tooltipId: string }) {
  const label = orientation === "upright" ? local(ui.upright, lang) : local(ui.reversed, lang);
  const help = orientation === "upright" ? local(ui.uprightHelp, lang) : local(ui.reversedHelp, lang);

  return (
    <span
      className={`orientation-tag is-${context} ${orientation}`}
      tabIndex={0}
      aria-describedby={tooltipId}
    >
      <b>{label}</b>
      <span className="orientation-tooltip" id={tooltipId} role="tooltip">
        <i>ORIENTATION / SIGNAL</i>
        <span>{help}</span>
      </span>
    </span>
  );
}

function CardGroupTag({ card, lang, tooltipId }: { card: TarotCard; lang: Lang; tooltipId: string }) {
  return (
    <span className={`card-group-tag group-${card.group}`} tabIndex={0} aria-describedby={tooltipId}>
      <i aria-hidden="true" />
      <span>{local(card.groupName, lang)}</span>
      <span className="group-tooltip" id={tooltipId} role="tooltip">
        <b>ARCHIVE / GROUP</b>
        <span>{local(cardGroupHelp[card.group], lang)}</span>
      </span>
    </span>
  );
}

function fillEngineTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}

function buildEngineReading(item: DrawnCard, lang: Lang) {
  if (isVacancy(item.card)) return null;
  const stateId = item.orientation === "upright" ? "sunward" : "unanchored";
  const state = interpretationEngine.states[stateId];

  if (lang === "en") {
    const stateName = item.orientation === "upright" ? "Anchored" : "Unanchored";
    const rankIndex = Number(item.card.number) - 1;
    const rankId = engineRanks[rankIndex];
    const stage = rankId ? engineStageEn[rankId] : item.card.group === "major" ? "Civilizational structure" : "System role";
    const domain = item.card.group === "major" ? "a shared civilizational structure" : engineDomainEn[item.card.group as EngineSuit];
    return {
      axis: `${item.card.groupName.en} / ${stage} / ${stateName}`,
      text: `${item.card.name.en} locates the question in ${domain}. ${item.card.archive.en} In the ${stateName} state, ${item.orientation === "upright" ? item.card.upright.en : item.card.reversed.en} Continue by asking: ${item.card.question.en}`,
      disclaimer: "Anchored does not mean correct, and Unanchored does not mean wrong.",
    };
  }

  if (item.card.group === "major") {
    const major = interpretationEngine.majorArcana.find((card) => card.numeral === item.card.number);
    if (!major) return null;
    const phase = interpretationEngine.majorArcanaGrammar.phases.find((entry) => entry.id === major.phase);
    if (!phase) return null;
    const values: Record<string, string> = {
      numeral: major.numeral,
      cardName: major.nameZh,
      archetype: major.archetype,
      phaseName: phase.nameZh,
      phaseMeaning: phase.meaning,
      stateName: state.nameZh,
      majorStateMeaning: stateId === "sunward" ? major.sunward : major.unanchored,
      stateDefinition: state.definition,
      majorQuestion: major.coreQuestion,
    };
    const template = interpretationEngine.templates.major;
    const sections = {
      summary: fillEngineTemplate(template.summary, values),
      phase: fillEngineTemplate(template.phase, values),
      state: fillEngineTemplate(template.state, values),
      question: fillEngineTemplate(template.question, values),
    };
    return {
      axis: `${interpretationEngine.cardFamilies.major.nameZh} / ${phase.nameZh} / ${state.nameZh}`,
      text: fillEngineTemplate(template.full, sections),
      disclaimer: interpretationEngine.meta.stateDisclaimer,
    };
  }

  const suitId = item.card.group as EngineSuit;
  const suit = interpretationEngine.suits[suitId];
  const courtRoleId = engineCourtRoles[item.card.number];
  if (courtRoleId) {
    const role = interpretationEngine.courtRanks[courtRoleId];
    const courtCards = interpretationEngine.courtCards[suitId] as Array<{ role: string; nameZh: string; specific: string }>;
    const specific = courtCards.find((card) => card.role === courtRoleId);
    const values: Record<string, string> = {
      cardName: specific?.nameZh ?? item.card.name.zh,
      suitName: suit.nameZh,
      domain: suit.domain,
      roleName: role.nameZh,
      systemRole: role.systemRole,
      rolePlainMeaning: role.plainMeaning,
      roleSentence: role.roleSentence.replace("{force}", suit.domain),
      stateName: state.nameZh,
      roleStateMeaning: stateId === "sunward" ? role.sunward : role.unanchored,
      stateDefinition: state.definition,
      specific: specific?.specific ?? item.card.archive.zh,
      roleQuestion: role.coreQuestion,
    };
    const template = interpretationEngine.templates.court;
    const sections = {
      summary: fillEngineTemplate(template.summary, values),
      position: fillEngineTemplate(template.position, values),
      state: fillEngineTemplate(template.state, values),
      specific: fillEngineTemplate(template.specific, values),
      question: fillEngineTemplate(template.question, values),
    };
    return {
      axis: `${suit.nameZh} / ${role.nameZh} / ${state.nameZh}`,
      text: fillEngineTemplate(template.full, sections),
      disclaimer: interpretationEngine.meta.stateDisclaimer,
    };
  }

  const rankIndex = Number(item.card.number) - 1;
  if (!Number.isInteger(rankIndex) || rankIndex < 0 || rankIndex >= engineRanks.length) return null;
  const rankId = engineRanks[rankIndex];
  const rank = interpretationEngine.ranks[rankId];
  const specificCards = interpretationEngine.cards[suitId] as Array<{ rank: string; nameZh: string; specific: string }>;
  const specific = specificCards.find((card) => card.rank === rankId);

  const values: Record<string, string> = {
    cardName: specific?.nameZh ?? item.card.name.zh,
    suitName: suit.nameZh,
    domain: suit.domain,
    rankValue: String(rank.value),
    stageZh: rank.stageZh,
    plainMeaning: rank.plainMeaning,
    subject: suit.subject,
    stageSentence: rank.stageSentence.replace("{subject}", suit.subject),
    stateName: state.nameZh,
    rankStateMeaning: stateId === "sunward" ? rank.sunward : rank.unanchored,
    stateDefinition: state.definition,
    specific: specific?.specific ?? item.card.archive.zh,
    rankQuestion: rank.coreQuestion,
  };
  const template = interpretationEngine.templates.minorNumber;
  const sections = {
    summary: fillEngineTemplate(template.summary, values),
    development: fillEngineTemplate(template.development, values),
    state: fillEngineTemplate(template.state, values),
    specific: fillEngineTemplate(template.specific, values),
    question: fillEngineTemplate(template.question, values),
  };

  return {
    axis: `${suit.nameZh} / ${rank.stageZh} / ${state.nameZh}`,
    text: fillEngineTemplate(template.full, sections),
    disclaimer: interpretationEngine.meta.stateDisclaimer,
  };
}

function EngineReading({ item, lang }: { item: DrawnCard; lang: Lang }) {
  if (isVacancy(item.card)) return null;
  const reading = buildEngineReading(item, lang);
  const isArchiveFallback = !reading;

  return (
    <details className={`engine-reading ${isArchiveFallback ? "is-archive" : ""}`}>
      <summary>
        <span>{lang === "zh" ? "基础解释引擎" : "INTERPRETATION ENGINE"}</span>
        <b>{reading?.axis ?? (lang === "zh" ? "专属档案解读" : "ARCHIVE-SPECIFIC READING")}</b>
        <i aria-hidden="true">＋</i>
      </summary>
      <div className="engine-reading-body">
        <p>{reading?.text ?? (lang === "zh"
          ? `${item.card.group === "major" ? "大阿卡纳" : "宫廷牌"}不套用数字阶段规则；保留这张牌自身的世界观叙事与状态释义。${item.card.archive.zh} ${item.orientation === "upright" ? item.card.upright.zh : item.card.reversed.zh}`
          : `${item.card.group === "major" ? "Major Arcana" : "Court cards"} do not use the numbered-stage rules. This card keeps its archive-specific narrative and state meaning. ${item.card.archive.en} ${item.orientation === "upright" ? item.card.upright.en : item.card.reversed.en}`
        )}</p>
        <small>{reading?.disclaimer ?? (lang === "zh" ? "不强行把非数字牌解释为某个发展阶段。" : "Non-numbered cards are not forced into a developmental stage.")}</small>
      </div>
    </details>
  );
}

function buildMockAgentReading({
  question,
  spreadKey,
  drawn,
  eclipse,
  consensusDrift,
  lang,
}: {
  question: string;
  spreadKey: SpreadKey;
  drawn: DrawnCard[];
  eclipse: boolean;
  consensusDrift: Localized | null;
  lang: Lang;
}): MockAgentReading {
  const spread = spreads[spreadKey];
  const vacancyIndex = drawn.findIndex((item) => isVacancy(item.card));
  const hasVacancy = vacancyIndex >= 0;
  const stateLabel = (item: DrawnCard) => item.orientation === "none"
    ? (lang === "zh" ? "无方向" : "NO ORIENTATION")
    : local(item.orientation === "upright" ? ui.upright : ui.reversed, lang);
  const evidenceLabel = (index: number) => `${local(spread.positions[index].name, lang)} × ${local(drawn[index].card.name, lang)} × ${stateLabel(drawn[index])}`;

  const positionReadings = drawn.map((item, index) => {
    const position = spread.positions[index];
    const meaning = local(item.orientation === "none" || item.orientation === "upright" ? item.card.upright : item.card.reversed, lang);
    return {
      positionIndex: index + 1,
      headline: `${local(position.name, lang)}｜${local(item.card.name, lang)}`,
      interpretation: lang === "zh"
        ? `在“${local(position.name, lang)}”位置，这张牌回应的是“${local(position.function, lang)}”。${meaning} 这里应把它视为对当前问题的观察线索，而不是独立的吉凶结论。`
        : `In ${local(position.name, lang)}, this card addresses ${local(position.function, lang).toLowerCase()}. ${meaning} Read it as evidence for the present question, not as an isolated verdict.`,
      evidence: [evidenceLabel(index)],
    };
  });

  const relationships: MockAgentReading["relationships"] = [];
  if (spreadKey === "twin") {
    relationships.push({
      type: "cost",
      positions: [1, 2],
      interpretation: lang === "zh"
        ? `“${drawn[0].card.name.zh}”提供的价值，需要与“${drawn[1].card.name.zh}”揭示的代价放在同一个交换关系里理解。真正要确认的不是哪张牌更好，而是这项交换是否仍然值得。`
        : `The value offered by ${drawn[0].card.name.en} must be read beside the cost revealed by ${drawn[1].card.name.en}. The question is whether that exchange remains worthwhile, not which card is better.`,
    });
  } else if (spreadKey === "three") {
    relationships.push({
      type: "progression",
      positions: [1, 2, 3],
      interpretation: lang === "zh"
        ? `这组三张牌形成“支撑—裂隙—再显”的连续观察：先辨认仍在维持局面的条件，再承认已经无法忽略的矛盾，最后寻找旧解释松动后重新可见的可能。`
        : `These cards form a support–rift–reappearance sequence: identify what still holds the situation, acknowledge the contradiction that can no longer be ignored, then notice what becomes visible as the old explanation loosens.`,
    });
  } else {
    relationships.push(
      {
        type: "projection",
        positions: [1, 2],
        interpretation: lang === "zh"
          ? `“光”与“投影”需要被分开：前者描述真实功能，后者描述被附加上去的期待。两者越相似，越需要现实证据来区分。`
          : `Light and Projection must be separated: one describes real function, the other an attached expectation. The more alike they appear, the more they require real-world evidence.`,
      },
      {
        type: "tension",
        positions: [3, 4, 5],
        interpretation: lang === "zh"
          ? `“校准体—失锚—余晖”显示隐藏成本、离开时最先失去的东西，以及中心退场后仍然存在的价值。它们共同决定你是否真的需要维持当前解释。`
          : `Calibrator, Unmooring, and Afterglow reveal hidden maintenance, the first loss on leaving, and the value that remains after the center recedes. Together they test whether the current explanation must be maintained.`,
      },
    );
  }

  const systemDiagnosis: MockAgentReading["systemDiagnosis"] = hasVacancy
    ? {
        level: "vacancy",
        headline: lang === "zh" ? "中心假设尚未证实" : "CENTRAL ASSUMPTION UNVERIFIED",
        interpretation: lang === "zh"
          ? `空位出现在“${spread.positions[vacancyIndex].name.zh}”。在继续解释其他牌之前，需要先确认：被放在这个位置中心的前提，是否真的得到现实证据支持。`
          : `The Vacancy appears in ${spread.positions[vacancyIndex].name.en}. Before extending the rest of the reading, verify whether the premise placed at the center of this position has real-world support.`,
      }
    : eclipse
      ? {
          level: "eclipse",
          headline: lang === "zh" ? "表面解释正在遮蔽运行机制" : "THE SURFACE EXPLANATION IS OBSCURING THE MECHANISM",
          interpretation: local(ui.eclipseCopy, lang),
        }
      : consensusDrift
        ? {
            level: "drift",
            headline: local(ui.drift, lang),
            interpretation: local(consensusDrift, lang),
          }
        : {
            level: "normal",
            headline: lang === "zh" ? "未发现需要优先升级的系统信号" : "NO PRIORITY SYSTEM SIGNAL DETECTED",
            interpretation: lang === "zh"
              ? "当前可以按照牌阵位置逐项阅读，同时保留不同解释之间的差异。"
              : "Read the positions in order while preserving differences between interpretations.",
          };

  const firstName = local(drawn[0].card.name, lang);
  const lastName = local(drawn[drawn.length - 1].card.name, lang);
  const directAnswer = lang === "zh"
    ? spreadKey === "twin"
      ? `这件事确实提供了由“${firstName}”代表的价值，但它同时要求你承担“${lastName}”所指出的代价。判断重点应从“要不要”转向“这项交换是否仍然成立”。`
      : spreadKey === "three"
        ? `当前局面仍有支撑，但裂隙已经提供了需要重新判断的证据。下一步不是立刻推翻旧结论，而是观察“${lastName}”所代表的新可能能否在现实中出现。`
        : `这组牌要求你把真实价值、个人投影和隐藏成本拆开。只有在中心解释退场后仍然存在的东西，才更接近这次选择的真实基础。`
    : spreadKey === "twin"
      ? `This situation offers the value represented by ${firstName}, while asking you to carry the cost named by ${lastName}. Shift from “should I?” to “does this exchange still hold?”`
      : spreadKey === "three"
        ? `The situation still has support, but the rift now supplies evidence that requires a new judgment. Do not overturn the old conclusion immediately; test whether the possibility represented by ${lastName} can appear in reality.`
        : `Separate real value, personal projection, and hidden cost. What remains after the central explanation recedes is closer to the real basis of the choice.`;

  return {
    questionCalibration: {
      summary: lang === "zh"
        ? `围绕“${question}”，这次观测不负责预测结果，而是辨认当前解释提供了什么、遮蔽了什么，以及你可以怎样验证。`
        : `For “${question}”, this reading does not predict an outcome. It identifies what the current explanation provides, what it obscures, and how it can be tested.`,
      hiddenAssumption: hasVacancy
        ? (lang === "zh" ? `可能的隐藏前提：你已经默认“${spread.positions[vacancyIndex].function.zh}”确实存在，但它尚未被证实。` : `Possible hidden premise: you have assumed that ${spread.positions[vacancyIndex].function.en.toLowerCase()} is present, but it has not yet been verified.`)
        : undefined,
    },
    positionReadings,
    relationships,
    systemDiagnosis,
    synthesis: {
      directAnswer,
      keyFinding: hasVacancy
        ? systemDiagnosis.interpretation
        : (lang === "zh" ? `最关键的线索位于“${spread.positions[drawn.length - 1].name.zh}”：${lastName}正在要求你把结论重新放回现实条件中验证。` : `The key signal lies in ${spread.positions[drawn.length - 1].name.en}: ${lastName} asks that the conclusion be tested against real conditions.`),
      uncertainty: lang === "zh"
        ? "牌面不能确认他人的动机，也不能替代现实证据；这里的关系判断仍需要由你的实际观察验证。"
        : "The cards cannot establish another person's motives or replace evidence; these relational inferences still require real-world verification.",
    },
    action: {
      nextStep: lang === "zh"
        ? `选择一条最容易验证的线索，在接下来七天记录它是否真实出现；不要同时验证所有解释。`
        : "Choose the easiest signal to test and record whether it appears during the next seven days; do not test every interpretation at once.",
      verification: lang === "zh"
        ? `优先寻找可观察的行为、时间投入、资源变化或身体感受。如果只能找到想象，没有现实痕迹，就把它保留为投影。`
        : "Look for observable behavior, time investment, resource change, or bodily experience. If only imagination is present, retain it as projection rather than fact.",
    },
    followUpQuestions: hasVacancy
      ? [lang === "zh" ? "我把什么未经证实的前提放在了中心？" : "Which unverified premise have I placed at the center?", ...spread.positions.slice(0, 2).map((position) => local(position.question, lang))]
      : spread.positions.slice(0, 3).map((position) => local(position.question, lang)),
    disclaimer: lang === "zh"
      ? "本结果用于演示未来 AI 综合解析的结构，不代表真实模型输出，也不构成确定预测或专业建议。"
      : "This result demonstrates the future AI synthesis structure. It is not a live model output, a certain prediction, or professional advice.",
  };
}

function SynthesisAgentPanel({
  lang,
  status,
  progress,
  result,
  hasQuestion,
  hasVacancy,
  onGenerate,
}: {
  lang: Lang;
  status: AgentStatus;
  progress: number;
  result: MockAgentReading | null;
  hasQuestion: boolean;
  hasVacancy: boolean;
  onGenerate: () => void;
}) {
  const statusLabel = status === "processing" ? agentUi.processing : status === "ready" ? agentUi.complete : agentUi.ready;
  return (
    <section className={`synthesis-agent status-${status} ${hasVacancy ? "has-vacancy" : ""}`} aria-live="polite">
      <header className="agent-header">
        <div><span>AI / SYNTHESIS 01</span><h2>{local(agentUi.title, lang)}</h2></div>
        <p><i aria-hidden="true" />{local(statusLabel, lang)}</p>
      </header>

      {status === "idle" ? (
        <div className="agent-ready-state">
          <div>
            <span>{local(agentUi.localDemo, lang)}</span>
            <p>{local(agentUi.intro, lang)}</p>
            <small>{local(agentUi.demoNote, lang)}</small>
          </div>
          <button type="button" onClick={onGenerate} disabled={!hasQuestion}>
            <span>{local(hasQuestion ? agentUi.generate : agentUi.needsQuestion, lang)}</span><i aria-hidden="true">→</i>
          </button>
        </div>
      ) : null}

      {status === "processing" ? (
        <div className="agent-processing-state">
          <div className="agent-orbit" aria-hidden="true"><i /><i /></div>
          <ol>
            {agentUi.steps[lang].map((step, index) => <li className={index <= progress ? "active" : ""} key={step}><span>0{index + 1}</span><b>{step}</b><i /></li>)}
          </ol>
        </div>
      ) : null}

      {status === "ready" && result ? (
        <div className="agent-result">
          <section className="agent-calibration">
            <span>{local(agentUi.calibration, lang)}</span>
            <p>{result.questionCalibration.summary}</p>
            {result.questionCalibration.hiddenAssumption ? <blockquote>{result.questionCalibration.hiddenAssumption}</blockquote> : null}
          </section>

          <section className="agent-synthesis-summary">
            <span>{local(agentUi.synthesis, lang)}</span>
            <h3>{result.synthesis.directAnswer}</h3>
            <p>{result.synthesis.keyFinding}</p>
            <small>{result.synthesis.uncertainty}</small>
          </section>

          <section className={`agent-diagnosis level-${result.systemDiagnosis.level}`}>
            <span>{local(agentUi.diagnosis, lang)}</span>
            <div><b>{result.systemDiagnosis.headline}</b><p>{result.systemDiagnosis.interpretation}</p></div>
          </section>

          <section className="agent-detail-section">
            <div className="agent-section-title"><span>01</span><h3>{local(agentUi.positions, lang)}</h3></div>
            <div className="agent-position-grid">
              {result.positionReadings.map((reading) => (
                <article key={reading.positionIndex}>
                  <span>0{reading.positionIndex}</span><h4>{reading.headline}</h4><p>{reading.interpretation}</p>
                  <small><b>{local(agentUi.evidence, lang)}</b>{reading.evidence.join(" / ")}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="agent-detail-section">
            <div className="agent-section-title"><span>02</span><h3>{local(agentUi.relations, lang)}</h3></div>
            <div className="agent-relationship-list">
              {result.relationships.map((relationship, index) => <p key={`${relationship.type}-${index}`}><span>{relationship.type.toUpperCase()} / {relationship.positions.join("—")}</span>{relationship.interpretation}</p>)}
            </div>
          </section>

          <div className="agent-closing-grid">
            <section>
              <span>03 / {local(agentUi.action, lang)}</span>
              <h3>{result.action.nextStep}</h3>
              <p><b>{local(agentUi.verify, lang)}</b>{result.action.verification}</p>
            </section>
            <section>
              <span>04 / {local(agentUi.followUp, lang)}</span>
              <ol>{result.followUpQuestions.map((item) => <li key={item}>{item}</li>)}</ol>
            </section>
          </div>

          <div className="agent-result-footer">
            <p>{result.disclaimer}</p>
            <button type="button" onClick={onGenerate}><i aria-hidden="true">↻</i>{local(agentUi.regenerate, lang)}</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CardBack() {
  return <div className="card-back" style={{ backgroundImage: `url("${assetPath("/cards/card-back.webp")}")` }} aria-hidden="true" />;
}

function TarotCardFace({ card, orientation, lang, pending = true }: { card: TarotCard; orientation: Orientation; lang: Lang; pending?: boolean }) {
  return (
    <div className={`card-front ${orientation === "reversed" ? "is-reversed" : ""} ${isVacancy(card) ? "is-vacancy" : ""}`}>
      <div className="card-image-wrap">
        {isVacancy(card) ? <div className="vacancy-card-surface" role="img" aria-label={local(card.name, lang)} /> : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="card-art" src={card.image} alt={local(card.name, lang)} />
        )}
        {!card.hasArt && pending ? <span className="pending-label">{local(ui.archivePending, lang)}</span> : null}
      </div>
    </div>
  );
}

function DrawCardView({ item, position, index, lang, revealed, onOpen }: { item: DrawnCard; position: SpreadPosition; index: number; lang: Lang; revealed: boolean; onOpen: () => void }) {
  return (
    <article className="draw-position" style={{ "--delay": `${index * 180}ms` } as CSSProperties}>
      <button
        className={`flip-card ${revealed ? "is-revealed" : "is-concealed"}`}
        onClick={() => revealed && onOpen()}
        aria-label={revealed ? `${local(item.card.name, lang)} · ${local(position.name, lang)}` : local(position.name, lang)}
        aria-disabled={!revealed}
        tabIndex={revealed ? 0 : -1}
      >
        <div className="flip-inner" aria-hidden="true">
          <CardBack />
          <TarotCardFace card={item.card} orientation={item.orientation} lang={lang} />
        </div>
      </button>
      <div className={`position-label ${revealed ? "is-revealed" : "is-concealed"}`}>
        <span>0{index + 1}</span>
        <div>
          <p>{local(position.name, lang)}</p>
          {revealed ? (
            <>
              <b>{local(item.card.name, lang)}</b>
              <div className="draw-card-tags">
                {item.orientation !== "none" ? <OrientationTag orientation={item.orientation} lang={lang} context="draw" tooltipId={`draw-orientation-help-${index}`} /> : null}
                <CardGroupTag card={item.card} lang={lang} tooltipId={`draw-group-help-${index}`} />
              </div>
            </>
          ) : <b className="position-function">{local(position.function, lang)}</b>}
        </div>
      </div>
    </article>
  );
}

function SpreadPositionPreview({ position, index, lang }: { position: SpreadPosition; index: number; lang: Lang }) {
  return (
    <article className="draw-position is-placeholder" style={{ "--placeholder-delay": `${index * 220}ms` } as CSSProperties}>
      <div className="spread-placeholder">
        <div className="placeholder-index"><span>0{index + 1}</span><i /></div>
        <div className="placeholder-orbit" aria-hidden="true"><i /><i /></div>
        <h3>{local(position.name, lang)}</h3>
        <p>{local(position.function, lang)}</p>
        <blockquote>{local(position.question, lang)}</blockquote>
      </div>
    </article>
  );
}

function ArchiveModal({ card, orientation, lang, onClose, onOrientation }: { card: TarotCard; orientation: Orientation; lang: Lang; onClose: () => void; onOrientation: (value: Orientation) => void }) {
  return (
    <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="archive-modal" role="dialog" aria-modal="true" aria-label={local(card.name, lang)}>
        <button className="modal-close" onClick={onClose} aria-label={local(ui.close, lang)}>×</button>
        <div className="modal-card-column">
          <div className="modal-card-frame">
            <TarotCardFace card={card} orientation={orientation} lang={lang} />
          </div>
          {!isVacancy(card) ? (
            <div className="orientation-toggle" role="group" aria-label="orientation">
              <button className={orientation === "upright" ? "active" : ""} onClick={() => onOrientation("upright")}>{local(ui.upright, lang)}</button>
              <button className={orientation === "reversed" ? "active" : ""} onClick={() => onOrientation("reversed")}>{local(ui.reversed, lang)}</button>
            </div>
          ) : null}
        </div>
        <div className="modal-copy">
          <div className="archive-id"><span>{local(ui.archiveNumber, lang)}</span><b>{archiveCode(card)} / {card.groupName.en.toUpperCase()}</b></div>
          <p className="modal-kicker">{local(card.groupName, lang)}</p>
          <h2>{local(card.name, lang)}</h2>
          <p className="english-name">{lang === "zh" ? card.name.en : card.name.zh}</p>
          <div className="archive-rule" />
          <div className="meaning-block">
            <h3>{local(ui.meaning, lang)}</h3>
            <p>{local(card.archive, lang)}</p>
          </div>
          <div className={`orientation-meaning ${isVacancy(card) ? "none" : orientation}`}>
            <span>{isVacancy(card) ? local(ui.vacancyMeaning, lang) : orientation === "upright" ? local(ui.upright, lang) : local(ui.reversed, lang)}</span>
            <p>{local(isVacancy(card) || orientation === "upright" ? card.upright : card.reversed, lang)}</p>
          </div>
          <div className="meta-pair">
            <div><h3>{local(ui.keywords, lang)}</h3><p>{local(card.keywords, lang)}</p></div>
            <div><h3>{local(ui.coreQuestion, lang)}</h3><p>{local(card.question, lang)}</p></div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InlineArchiveDetail({ card, orientation, lang, onClose, onOrientation }: { card: TarotCard; orientation: Orientation; lang: Lang; onClose: () => void; onOrientation: (value: Orientation) => void }) {
  return (
    <section className="archive-inline-detail" id="library-detail" aria-label={`${local(card.name, lang)} · ${local(ui.viewArchive, lang)}`}>
      <button className="inline-close" onClick={onClose} aria-label={local(ui.close, lang)}>×</button>
      <div className="inline-art-column">
        <div className="inline-card-frame">
          <TarotCardFace card={card} orientation={orientation} lang={lang} />
        </div>
        {!isVacancy(card) ? (
          <div className="orientation-toggle inline-toggle" role="group" aria-label="orientation">
            <button className={orientation === "upright" ? "active" : ""} onClick={() => onOrientation("upright")}>{local(ui.upright, lang)}</button>
            <button className={orientation === "reversed" ? "active" : ""} onClick={() => onOrientation("reversed")}>{local(ui.reversed, lang)}</button>
          </div>
        ) : null}
      </div>
      <div className="inline-detail-copy">
        <div className="inline-archive-id"><span>{local(ui.archiveNumber, lang)}</span><b>{archiveCode(card)} / {card.groupName.en.toUpperCase()}</b></div>
        <p className="inline-kicker">{local(card.groupName, lang)} · {card.name.en}</p>
        <h2>{local(card.name, lang)}</h2>
        <div className="inline-rule" />
        <div className="inline-copy-grid">
          <div className="inline-slice">
            <h3>{local(ui.meaning, lang)}</h3>
            <p>{local(card.archive, lang)}</p>
          </div>
          <div className={`inline-orientation ${isVacancy(card) ? "none" : orientation}`}>
            <h3>{isVacancy(card) ? local(ui.vacancyMeaning, lang) : orientation === "upright" ? local(ui.upright, lang) : local(ui.reversed, lang)}</h3>
            <p>{local(isVacancy(card) || orientation === "upright" ? card.upright : card.reversed, lang)}</p>
          </div>
        </div>
        <div className="inline-meta-pair">
          <div><h3>{local(ui.keywords, lang)}</h3><p>{local(card.keywords, lang)}</p></div>
          <div><h3>{local(ui.coreQuestion, lang)}</h3><p>{local(card.question, lang)}</p></div>
        </div>
      </div>
    </section>
  );
}

export default function TarotSite() {
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const drawModuleRef = useRef<HTMLElement>(null);
  const questionModuleRef = useRef<HTMLElement>(null);
  const spreadSelectorRef = useRef<HTMLDivElement>(null);
  const spreadDrawSlotRef = useRef<HTMLDivElement>(null);
  const spreadDrawAreaRef = useRef<HTMLDivElement>(null);
  const drawReturnTopRef = useRef<number | null>(null);
  const interpretationRef = useRef<HTMLElement>(null);
  const [lang, setLang] = useState<Lang>("zh");
  const [view, setView] = useState<View>("draw");
  const [spread, setSpread] = useState<SpreadKey>("three");
  const [spreadSelected, setSpreadSelected] = useState(false);
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [drawKey, setDrawKey] = useState(0);
  const [selected, setSelected] = useState<TarotCard | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<Orientation>("upright");
  const [expandedCard, setExpandedCard] = useState<TarotCard | null>(null);
  const [expandedOrientation, setExpandedOrientation] = useState<Orientation>("upright");
  const [filter, setFilter] = useState<"all" | TarotCard["group"]>("all");
  const [query, setQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [questionDraft, setQuestionDraft] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(true);
  const [questionModuleVisible, setQuestionModuleVisible] = useState(false);
  const [spreadSelectorVisible, setSpreadSelectorVisible] = useState(false);
  const [scrollMode, setScrollMode] = useState<"flat" | "stacked">("flat");

  useEffect(() => {
    const saved = window.localStorage.getItem("fake-sun-language");
    if (saved === "zh" || saved === "en") setLang(saved);
    const savedScrollMode = window.localStorage.getItem("fake-sun-scroll-mode");
    if (savedScrollMode === "flat" || savedScrollMode === "stacked") setScrollMode(savedScrollMode);
    const savedQuestion = window.localStorage.getItem("fake-sun-question")?.trim();
    if (savedQuestion) {
      setQuestion(savedQuestion);
      setQuestionDraft(savedQuestion);
      setEditingQuestion(false);
    }
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduceMotion.matches || !finePointer.matches) return;

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    let current = window.scrollY;
    let target = current;
    let animationFrame = 0;

    const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);
    const clampScroll = (value: number) => Math.min(maxScroll(), Math.max(0, value));
    const canNestedElementScroll = (eventTarget: EventTarget | null, direction: number) => {
      let element = eventTarget instanceof Element ? eventTarget : null;
      while (element && element !== document.body) {
        const style = window.getComputedStyle(element);
        const scrollable = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1;
        if (scrollable) {
          const canMoveUp = direction < 0 && element.scrollTop > 0;
          const canMoveDown = direction > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 1;
          if (canMoveUp || canMoveDown) return true;
        }
        element = element.parentElement;
      }
      return false;
    };

    const animateScroll = () => {
      const distance = target - current;
      current += distance * 0.06;

      if (Math.abs(distance) < 0.45) {
        current = target;
        animationFrame = 0;
        window.scrollTo(0, current);
        return;
      }

      window.scrollTo(0, current);
      animationFrame = window.requestAnimationFrame(animateScroll);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? window.innerHeight
          : 1;
      const delta = event.deltaY * multiplier;
      if (!delta || canNestedElementScroll(event.target, delta)) return;

      event.preventDefault();
      if (!animationFrame) {
        current = window.scrollY;
        target = current;
      }
      target = clampScroll(target + delta);
      if (!animationFrame) animationFrame = window.requestAnimationFrame(animateScroll);
    };

    const onNativeScroll = () => {
      if (animationFrame) return;
      current = window.scrollY;
      target = current;
    };

    root.style.scrollBehavior = "auto";
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onNativeScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onNativeScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  useEffect(() => {
    const slot = spreadDrawSlotRef.current;
    const drawArea = spreadDrawAreaRef.current;
    const interpretation = interpretationRef.current;
    if (scrollMode !== "stacked" || !revealed || !slot || !drawArea || !interpretation) return;

    let animationFrame = 0;
    let hasUsedInitialFixedPosition = false;
    const updateReadingStack = () => {
      animationFrame = 0;
      const slotRect = slot.getBoundingClientRect();
      const interpretationRect = interpretation.getBoundingClientRect();
      const fixedTop = drawReturnTopRef.current ?? (window.innerWidth <= 820 ? 65 : 122);
      const drawHeight = drawArea.offsetHeight;
      slot.style.setProperty("--draw-slot-height", `${drawHeight}px`);
      slot.style.setProperty("--draw-fixed-left", `${slotRect.left}px`);
      slot.style.setProperty("--draw-fixed-width", `${slotRect.width}px`);
      const shouldFix = slotRect.top <= fixedTop && interpretationRect.top > fixedTop;
      if (shouldFix && !slot.classList.contains("is-fixed")) {
        const nextFixedTop = hasUsedInitialFixedPosition
          ? fixedTop
          : Math.min(fixedTop, slotRect.top);
        slot.style.setProperty("--draw-fixed-top", `${nextFixedTop}px`);
        hasUsedInitialFixedPosition = true;
      }
      slot.classList.toggle("is-fixed", shouldFix);
    };
    const requestUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateReadingStack);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    updateReadingStack();
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      slot.classList.remove("is-fixed");
      slot.style.removeProperty("--draw-slot-height");
      slot.style.removeProperty("--draw-fixed-left");
      slot.style.removeProperty("--draw-fixed-width");
      slot.style.removeProperty("--draw-fixed-top");
    };
  }, [revealed, spread, drawn.length, scrollMode]);

  useEffect(() => {
    const interpretation = interpretationRef.current;
    if (scrollMode !== "stacked" || !revealed || !interpretation) return;

    let animationFrame = 0;
    const updateStickyTop = () => {
      animationFrame = 0;
      interpretation.style.setProperty("--interpretation-sticky-top", `${window.innerHeight - interpretation.offsetHeight}px`);
    };
    const requestUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateStickyTop);
    };
    const resizeObserver = new ResizeObserver(requestUpdate);

    resizeObserver.observe(interpretation);
    window.addEventListener("resize", requestUpdate);
    updateStickyTop();
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", requestUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      interpretation.style.removeProperty("--interpretation-sticky-top");
    };
  }, [revealed, drawn.length, lang, spread, scrollMode]);

  useEffect(() => {
    const hero = heroRef.current;
    const video = heroVideoRef.current;
    const drawModule = drawModuleRef.current;
    if (!hero || !video || !drawModule) return;

    let animationFrame = 0;
    let targetTime = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const readScrollTarget = () => {
      const start = hero.offsetTop;
      const textDistance = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const textProgress = reduceMotion
        ? 0
        : Math.min(1, Math.max(0, (window.scrollY - start) / textDistance));
      const videoProgress = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(hero.offsetHeight, 1)));
      const panelEntrySecond = 2.1;
      const panelEntryProgress = Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(1, panelEntrySecond / video.duration)
        : 0.42;
      const panelOverlap = window.innerHeight - hero.offsetHeight * (1 - panelEntryProgress);
      drawModule.style.setProperty("--draw-module-overlap", `${panelOverlap}px`);
      hero.style.setProperty("--hero-title-opacity", `${Math.max(0, 1 - textProgress * 1.15)}`);
      hero.style.setProperty("--hero-kicker-opacity", `${Math.max(0, 1 - textProgress * 1.45)}`);
      hero.style.setProperty("--hero-description-opacity", `${Math.max(0, 1 - textProgress * 2.1)}`);
      hero.style.setProperty("--hero-interface-opacity", `${Math.max(0, 1 - Math.max(0, textProgress - 0.28) * 1.7)}`);
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      targetTime = videoProgress * Math.max(video.duration - 0.01, 0);
    };
    const applyLatestTarget = () => {
      animationFrame = 0;
      if (video.seeking || Math.abs(video.currentTime - targetTime) <= 0.025) return;
      video.currentTime = targetTime;
    };
    const requestApply = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(applyLatestTarget);
    };
    const syncVideoToScroll = () => {
      readScrollTarget();
      requestApply();
    };
    const continueToLatestTarget = () => {
      if (Math.abs(video.currentTime - targetTime) > 0.025) requestApply();
    };

    video.pause();
    video.addEventListener("loadedmetadata", syncVideoToScroll);
    video.addEventListener("seeked", continueToLatestTarget);
    window.addEventListener("scroll", syncVideoToScroll, { passive: true });
    window.addEventListener("resize", syncVideoToScroll);
    syncVideoToScroll();

    return () => {
      video.removeEventListener("loadedmetadata", syncVideoToScroll);
      video.removeEventListener("seeked", continueToLatestTarget);
      window.removeEventListener("scroll", syncVideoToScroll);
      window.removeEventListener("resize", syncVideoToScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    const module = questionModuleRef.current;
    if (!module) return;
    if (!("IntersectionObserver" in window)) {
      setQuestionModuleVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setQuestionModuleVisible(true);
      observer.disconnect();
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    observer.observe(module);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const selector = spreadSelectorRef.current;
    if (!selector) return;
    if (!("IntersectionObserver" in window)) {
      setSpreadSelectorVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setSpreadSelectorVisible(true);
      observer.disconnect();
    }, { threshold: 0.45, rootMargin: "0px 0px -4% 0px" });
    observer.observe(selector);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("fake-sun-language", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSelected(null);
      setExpandedCard(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    setExpandedCard(null);
  }, [filter, query]);

  useEffect(() => {
    if (!expandedCard) return;
    const frame = window.requestAnimationFrame(() => document.getElementById("library-detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    return () => window.cancelAnimationFrame(frame);
  }, [expandedCard]);

  const currentSpread = spreads[spread];

  const eclipse = useMemo(() => {
    const ids = drawn.map((item) => item.card.number);
    const pair = (a: string, b: string) => ids.includes(a) && ids.includes(b);
    const reversedMajor = drawn.filter((item) => item.card.group === "major" && item.orientation === "reversed").length;
    return pair("XIX", "XVI") || pair("XIX", "XVIII") || pair("V", "XII") || reversedMajor >= 3;
  }, [drawn]);

  const groupCounts = useMemo(() => drawn.reduce<Record<TarotCard["group"], number>>((counts, item) => {
    counts[item.card.group] += 1;
    return counts;
  }, { major: 0, fragments: 0, rings: 0, rifts: 0, vessels: 0, vacancy: 0 }), [drawn]);

  const consensusDrift = useMemo(() => {
    if (!drawn.length) return null;
    const counts = drawn.reduce<Record<string, number>>((acc, item) => {
      acc[item.card.group] = (acc[item.card.group] ?? 0) + 1;
      return acc;
    }, {});
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!dominant || dominant[0] === "major" || dominant[1] <= drawn.length / 2) return null;
    const messages: Record<string, Localized> = {
      fragments: { zh: "光像过多：愿景很强，证据与落地条件不足。", en: "Fragments dominate: vision is strong, while evidence and implementation are thin." },
      rings: { zh: "同步过多：过度追求彼此一致，关系边界不足。", en: "Rings dominate: agreement is overvalued and relational boundaries are thin." },
      rifts: { zh: "裂隙过多：分析与怀疑过载，行动可能被冻结。", en: "Rifts dominate: analysis and doubt are overloaded, potentially freezing action." },
      vessels: { zh: "载体过多：资源与生存压力正在压缩想象空间。", en: "Vessels dominate: resource and survival pressure are compressing imagination." },
    };
    return messages[dominant[0]];
  }, [drawn]);

  const filteredCards = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tarotCards.filter((card) => {
      const groupMatch = filter === "all" || card.group === filter;
      const searchable = `${card.name.zh} ${card.name.en} ${card.keywords.zh} ${card.keywords.en}`.toLowerCase();
      return groupMatch && (!needle || searchable.includes(needle));
    });
  }, [filter, query]);

  function handleDraw() {
    const pool = [...tarotCards];
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[target]] = [pool[target], pool[index]];
    }
    setDrawn(pool.slice(0, currentSpread.count).map((card) => ({
      card,
      orientation: isVacancy(card) ? "none" : Math.random() < 0.5 ? "upright" : "reversed",
    })));
    setRevealed(false);
    setDrawKey((value) => value + 1);
  }

  function selectSpread(key: SpreadKey) {
    setSpread(key);
    setSpreadSelected(true);
    setDrawn([]);
    setRevealed(false);
    window.setTimeout(() => {
      const drawArea = spreadDrawAreaRef.current;
      const firstCard = drawArea?.querySelector<HTMLElement>(".spread-placeholder");
      const drawControl = drawArea?.querySelector<HTMLElement>(".draw-control");
      if (!drawArea || !firstCard || !drawControl) return;
      const headerBottom = document.querySelector<HTMLElement>(".site-header")?.getBoundingClientRect().bottom ?? 0;
      const bottomNav = document.querySelector<HTMLElement>(".site-header nav");
      const bottomNavRect = bottomNav?.getBoundingClientRect();
      const bottomBoundary = bottomNav && bottomNavRect && window.getComputedStyle(bottomNav).position === "fixed" && bottomNavRect.top > headerBottom
        ? bottomNavRect.top
        : window.innerHeight;
      const documentTop = (element: HTMLElement) => {
        let top = 0;
        let offsetElement: HTMLElement | null = element;
        while (offsetElement) {
          top += offsetElement.offsetTop;
          offsetElement = offsetElement.offsetParent as HTMLElement | null;
        }
        return top;
      };
      const drawAreaDocumentTop = documentTop(drawArea);
      const cardDocumentTop = documentTop(firstCard);
      const controlDocumentBottom = documentTop(drawControl) + drawControl.offsetHeight;
      const visibleContentHeight = controlDocumentBottom - cardDocumentTop;
      const targetTop = Math.max(headerBottom + 24, bottomBoundary - 16 - visibleContentHeight);
      drawReturnTopRef.current = targetTop - (cardDocumentTop - drawAreaDocumentTop);
      window.scrollTo({
        top: Math.max(0, cardDocumentTop - targetTop),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }, 60);
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuestion = questionDraft.trim();
    if (!nextQuestion) return;
    setQuestion(nextQuestion);
    setQuestionDraft(nextQuestion);
    setEditingQuestion(false);
    window.localStorage.setItem("fake-sun-question", nextQuestion);
  }

  function editQuestion() {
    setQuestion("");
    setQuestionDraft("");
    setEditingQuestion(true);
    window.localStorage.removeItem("fake-sun-question");
    window.setTimeout(() => document.getElementById("tarot-question")?.focus(), 20);
  }

  function handlePrimaryAction() {
    if (drawn.length && !revealed) {
      setRevealed(true);
      return;
    }
    if (drawn.length && revealed) {
      scrollTo("interpretation", "interpret");
      return;
    }
    handleDraw();
  }

  function openCard(card: TarotCard, orientation: Orientation = "upright") {
    setSelected(card);
    setSelectedOrientation(orientation);
  }

  function scrollTo(id: string, nextView: View) {
    setView(nextView);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  }

  function changeScrollMode(nextMode: "flat" | "stacked") {
    if (nextMode === scrollMode) return;
    setScrollMode(nextMode);
    window.localStorage.setItem("fake-sun-scroll-mode", nextMode);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }

  const navItems: Array<[View, Localized, string]> = [
    ["draw", ui.navDraw, "draw-module"],
    ["interpret", ui.navInterpret, "interpretation"],
    ["library", ui.navLibrary, "library"],
  ];

  const filters: Array<["all" | TarotCard["group"], Localized]> = [
    ["all", ui.all], ["major", ui.major], ["fragments", ui.fragments], ["rings", ui.rings], ["rifts", ui.rifts], ["vessels", ui.vessels], ["vacancy", ui.vacancy],
  ];

  return (
    <main className={`scroll-mode-${scrollMode}`}>
      <header className="site-header">
        <button className="brand" onClick={() => scrollTo("draw-module", "draw")} aria-label="Fake Sun Tarot home">
          <span className="brand-mark"><i /><i /></span>
          <span><b>伪日塔罗</b><small>FAKE SUN TAROT</small></span>
        </button>
        <nav aria-label="Primary navigation">
          {navItems.map(([key, label, id]) => (
            <button key={key} className={view === key ? "active" : ""} onClick={() => scrollTo(id, key)}>{local(label, lang)}</button>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="archive-lab-link" href="/archive-lab">
            <span>{lang === "zh" ? "透视牌库" : "PERSPECTIVE ARCHIVE"}</span><i>↗</i>
          </Link>
          <div className="lang-switch" aria-label="Language">
            <button className={lang === "zh" ? "active" : ""} onClick={() => setLang("zh")}>中</button>
            <span>/</span>
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
        </div>
      </header>

      <div className="scroll-mode-switch" role="group" aria-label={lang === "zh" ? "滚动模式对比" : "Scroll mode comparison"}>
        <span>{lang === "zh" ? "滚动模式" : "SCROLL"}</span>
        <button className={scrollMode === "flat" ? "active" : ""} onClick={() => changeScrollMode("flat")} aria-pressed={scrollMode === "flat"}>{lang === "zh" ? "平铺" : "FLAT"}</button>
        <button className={scrollMode === "stacked" ? "active" : ""} onClick={() => changeScrollMode("stacked")} aria-pressed={scrollMode === "stacked"}>{lang === "zh" ? "覆盖" : "STACK"}</button>
      </div>

      <section className="hero-sequence" id="draw-module" ref={heroRef}>
        <div className="hero">
          <video
            className="hero-video"
            ref={heroVideoRef}
            src={assetPath("/fake-sun-hero-scrub.m4v")}
            poster={assetPath("/fake-sun-hero.png")}
            preload="auto"
            muted
            playsInline
            aria-hidden="true"
            tabIndex={-1}
          />
          <div className="hero-copy">
            <p className="hero-title-en">FAKE SUN TAROT</p>
            <h1>伪日塔罗</h1>
            <p className="hero-description">{local(ui.heroCopy, lang)}</p>
          </div>
          <div className="hero-interface" aria-hidden="true">
            <aside className="hero-note note-observation">
              <header><b>OBSERVATION / 07</b><i /></header>
              <p>VECTOR&nbsp;&nbsp;00.0000° E</p>
              <p>EPOCH&nbsp;&nbsp;&nbsp;2141 / LIVE</p>
              <p>SOURCE&nbsp;&nbsp;UNRESOLVED</p>
              <span className="note-scan" />
            </aside>

            <aside className="hero-note note-warning">
              <header><span>△</span><b>CENTER ANOMALY</b></header>
              <p>ATTRIBUTION ACTIVE</p>
              <p>STELLAR SOURCE / NULL</p>
              <span className="warning-code">|||||||| ||| ||||||||</span>
            </aside>

            <aside className="hero-note note-probe">
              <header><b>PROBE / HEL—09</b><i /><i /></header>
              <dl>
                <div><dt>STATUS</dt><dd>NOMINAL</dd></div>
                <div><dt>LINK</dt><dd>STABLE</dd></div>
                <div><dt>DISTANCE</dt><dd>0.00 AU*</dd></div>
              </dl>
              <small>* REFERENCE FRAME UNSTABLE</small>
            </aside>

            <aside className="hero-note note-system">
              <header><b>SYSTEM ANOMALY / LEVEL S</b></header>
              <dl>
                <div><dt>THERMAL SOURCE</dt><dd>NONE</dd></div>
                <div><dt>PHOTON FLUX</dt><dd>NONE</dd></div>
                <div><dt>GRAVITY WELL</dt><dd>NONE</dd></div>
              </dl>
              <strong>CONCLUSION / CENTER UNVERIFIED</strong>
            </aside>
          </div>
        </div>
      </section>

      <section ref={drawModuleRef} className="draw-module">
        <div className="question-sequence">
          <div className="question-chapter section-shell">
            <section ref={questionModuleRef} className={`question-module ${question && !editingQuestion ? "has-question" : ""} ${questionModuleVisible ? "is-in-view" : ""}`} id="question-module" aria-labelledby="question-module-title">
          <div className="question-intro">
            <div>
              <p className="question-step question-reveal-line" style={{ "--reveal-delay": "0ms" } as CSSProperties}>{local(ui.questionStep, lang)}</p>
              <h2 className="question-reveal-line" style={{ "--reveal-delay": "95ms" } as CSSProperties} id="question-module-title">{local(ui.questionPrompt, lang)}</h2>
            </div>
            <div className="question-guidance">
              <p className="question-reveal-line" style={{ "--reveal-delay": "190ms" } as CSSProperties}>{local(ui.questionGuidance, lang)}</p>
              <ul>
                {ui.questionExamples[lang].map((example, index) => <li className="question-reveal-line" style={{ "--reveal-delay": `${(3 + index) * 95}ms` } as CSSProperties} key={example}>{example}</li>)}
              </ul>
            </div>
          </div>

          {question && !editingQuestion ? (
            <div className="submitted-question" aria-live="polite">
              <span className="question-reveal-line" style={{ "--reveal-delay": "570ms" } as CSSProperties}>{local(ui.currentQuestion, lang)}</span>
              <blockquote className="question-reveal-line" style={{ "--reveal-delay": "665ms" } as CSSProperties}>{question}</blockquote>
              <button className="question-reveal-line" style={{ "--reveal-delay": "760ms" } as CSSProperties} type="button" onClick={editQuestion}><i aria-hidden="true">↻</i>{local(ui.reenterQuestion, lang)}</button>
            </div>
          ) : (
            <form className="question-form" onSubmit={submitQuestion}>
              <label className="question-reveal-line" style={{ "--reveal-delay": "570ms" } as CSSProperties} htmlFor="tarot-question">{local(ui.questionLabel, lang)}</label>
              <textarea
                className="question-reveal-line"
                style={{ "--reveal-delay": "665ms" } as CSSProperties}
                id="tarot-question"
                value={questionDraft}
                onChange={(event) => setQuestionDraft(event.target.value)}
                placeholder={local(ui.questionPlaceholder, lang)}
                maxLength={240}
                rows={2}
              />
              <div className="question-reveal-line" style={{ "--reveal-delay": "760ms" } as CSSProperties}>
                <small>{questionDraft.length} / 240</small>
                <button type="submit" disabled={!questionDraft.trim()}><span>{local(ui.submitQuestion, lang)}</span><i aria-hidden="true">→</i></button>
              </div>
            </form>
          )}
            </section>
          </div>
        </div>

        <div className={`spread-chapter ${spreadSelected ? "has-spread" : ""} ${revealed ? "is-revealed" : ""}`}>
          <div className="spread-chapter-surface" aria-hidden="true" />
          <div className="spread-chapter-content section-shell">
          <div className="section-heading">
            <p>{local(ui.chooseSpread, lang)}</p>
            <span>SVAP / OBSERVATION ARRAY</span>
          </div>
          <div ref={spreadSelectorRef} className={`spread-selector ${spreadSelectorVisible ? "is-in-view" : ""}`}>
          {(Object.keys(spreads) as SpreadKey[]).map((key, index) => (
            <button
              key={key}
              className={`spread-reveal-card ${spreadSelected && spread === key ? "active" : ""}`}
              style={{ "--spread-reveal-delay": `${index * 420}ms` } as CSSProperties}
              onClick={() => selectSpread(key)}
            >
              <span>0{index + 1}</span>
              <b>{local(spreadGuides[key], lang)}</b>
              <small>{local(spreads[key].subtitle, lang)}</small>
              <i>{spreads[key].count} CARDS</i>
            </button>
          ))}
          </div>
          </div>

          {spreadSelected ? (
          <div ref={spreadDrawSlotRef} className="spread-draw-slot">
          <div ref={spreadDrawAreaRef} className="spread-draw-area section-shell">
          <div className={`spread-stage spread-${spread} ${drawn.length ? "has-draw" : ""}`} key={`${spread}-${drawKey}`}>
          {drawn.length ? drawn.map((item, index) => (
            <DrawCardView key={`${drawKey}-${item.card.id}`} item={item} position={currentSpread.positions[index]} index={index} lang={lang} revealed={revealed} onOpen={() => openCard(item.card, item.orientation)} />
          )) : (
            currentSpread.positions.map((position, index) => <SpreadPositionPreview key={`${spread}-${index}`} position={position} index={index} lang={lang} />)
          )}
          </div>

          <div className="draw-control">
          <div className="draw-actions">
            <button onClick={handlePrimaryAction} className="primary-action"><span>{!drawn.length ? local(ui.draw, lang) : revealed ? local(ui.viewReading, lang) : local(ui.reveal, lang)}</span><i>{revealed ? "↓" : "↗"}</i></button>
            {revealed ? (
              <button className="redraw-action" onClick={handleDraw}>
                <i aria-hidden="true">↻</i>
                <span>{local(ui.redraw, lang)}</span>
              </button>
            ) : null}
          </div>
          <p>RANDOM ORIENTATION / VACANCY HAS NONE / NO REPLACEMENT</p>
          </div>
          </div>
          </div>
          ) : null}
        </div>
      </section>

      <div className={`reading-archive-stack ${revealed ? "has-reading" : ""}`}>
      <section ref={interpretationRef} className={`interpretation section-shell ${revealed ? "is-overlay" : ""}`} id="interpretation">
        <div className="section-heading inverse">
          <p>{local(ui.readTitle, lang)}</p>
          <span>{currentSpread.title.en.toUpperCase()} / {revealed ? drawn.length : "—"} SIGNALS</span>
        </div>
        {question ? <div className="reading-question"><span>{local(ui.currentQuestion, lang)}</span><p>{question}</p></div> : null}
        {!drawn.length || !revealed ? (
          <div className="empty-reading"><span>∅</span><div><h2>{local(drawn.length ? ui.awaitingReveal : ui.noReading, lang)}</h2><p>{local(drawn.length ? ui.awaitingRevealCopy : ui.noReadingCopy, lang)}</p></div></div>
        ) : (
          <Fragment>
          <div className="reading-grid">
            <div className="reading-list">
              {drawn.map((item, index) => (
                <article key={item.card.id}>
                  <div className="reading-index"><span>0{index + 1}</span><i /></div>
                  <button
                    className={`reading-card-preview ${item.orientation}`}
                    onClick={() => openCard(item.card, item.orientation)}
                    aria-label={`${local(ui.viewArchive, lang)} · ${local(item.card.name, lang)}`}
                  >
                    {isVacancy(item.card) ? <span className="vacancy-preview" aria-hidden="true" /> : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.card.image} alt={local(item.card.name, lang)} />
                    )}
                  </button>
                  <div className="reading-copy">
                    <p className="reading-position">
                      <strong>{local(currentSpread.positions[index].name, lang)}</strong>
                      <span>{local(currentSpread.positions[index].function, lang)}</span>
                    </p>
                    <div className="reading-title-row">
                      <div className="reading-title-primary">
                        <h3>{item.card.name.zh}</h3>
                        {item.orientation !== "none" ? <OrientationTag orientation={item.orientation} lang={lang} context="reading" tooltipId={`reading-orientation-help-${index}`} /> : null}
                        <CardGroupTag card={item.card} lang={lang} tooltipId={`reading-group-help-${index}`} />
                      </div>
                      <small>{item.card.name.en}</small>
                    </div>
                    <p className="reading-meaning">{local(item.orientation === "none" || item.orientation === "upright" ? item.card.upright : item.card.reversed, lang)}</p>
                    <EngineReading item={item} lang={lang} />
                    <button onClick={() => openCard(item.card, item.orientation)}>{local(ui.viewArchive, lang)} <span>→</span></button>
                  </div>
                </article>
              ))}
            </div>
            <aside className={`diagnostic-panel ${groupCounts.vacancy > 0 ? "has-vacancy" : ""}`}>
              <div className="diagnostic-header"><span>DIAGNOSTIC / LIVE</span><i>{groupCounts.vacancy > 0 ? "∅" : "●"}</i></div>
              {groupCounts.vacancy > 0 ? (
                <div className="vacancy-alert-block">
                  <span aria-hidden="true">∅</span>
                  <div><b>{local(ui.vacancyAlert, lang)}</b><p>{local(ui.vacancyAlertCopy, lang)}</p></div>
                </div>
              ) : null}
              {eclipse ? <div className="alert-block"><b>{local(ui.eclipse, lang)}</b><p>{local(ui.eclipseCopy, lang)}</p></div> : null}
              {consensusDrift ? <div className="drift-block"><b>{local(ui.drift, lang)}</b><p>{local(consensusDrift, lang)}</p></div> : null}
              {!eclipse && !consensusDrift && groupCounts.vacancy === 0 ? (
                <div className="stable-block"><div className="mini-orbit"><i /><i /></div><b>{lang === "zh" ? "观测结构稳定" : "OBSERVATION STABLE"}</b><p>{lang === "zh" ? "未触发日蚀或单一牌组垄断。继续逐位阅读，不把一致误作唯一真相。" : "No eclipse or suit monopoly detected. Read each position without mistaking coherence for singular truth."}</p></div>
              ) : null}
              <div className="group-counts">
                {diagnosticGroups
                  .filter(({ key }) => key !== "vacancy" || groupCounts.vacancy > 0)
                  .map(({ key, label }) => {
                    const count = groupCounts[key];
                    const proportion = drawn.length ? count / drawn.length * 100 : 0;
                    return (
                      <span className={key === "vacancy" ? "is-vacancy" : ""} key={key} aria-label={`${local(label, lang)} ${count}`}>
                        <i style={{ width: `${proportion}%` }} />
                        <span className={`card-group-tag diagnostic-group-icon group-${key}`} aria-hidden="true"><i /></span>
                        <b>{local(label, lang)}</b>
                        <em>{count}</em>
                      </span>
                    );
                  })}
              </div>
            </aside>
          </div>
          </Fragment>
        )}
      </section>

      <section className="library section-shell" id="library">
        <div className="library-intro">
          <p className="eyebrow"><span />ARCHIVE INDEX / 79 RECORDS</p>
          <h2>{local(ui.libraryTitle, lang)}</h2>
          <p>{local(ui.libraryCopy, lang)}</p>
        </div>
        <div className="library-tools">
          <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={local(ui.search, lang)} /></label>
          <div className="filter-row">
            {filters.map(([key, label]) => <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>{local(label, lang)}</button>)}
          </div>
          <span className="result-count">{String(filteredCards.length).padStart(2, "0")} / 79</span>
        </div>
        <div className="library-grid">
          {filteredCards.map((card) => (
            <Fragment key={card.id}>
              <button
                className={`library-card ${isVacancy(card) ? "is-vacancy" : ""} ${expandedCard?.id === card.id ? "active" : ""}`}
                onClick={() => {
                  if (expandedCard?.id === card.id) {
                    setExpandedCard(null);
                    return;
                  }
                  setExpandedCard(card);
                  setExpandedOrientation(isVacancy(card) ? "none" : "upright");
                }}
                aria-expanded={expandedCard?.id === card.id}
                aria-controls={expandedCard?.id === card.id ? "library-detail" : undefined}
              >
                <div className="library-image">
                  {isVacancy(card) ? <span className="vacancy-library-surface" aria-hidden="true" /> : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={card.image} alt="" />
                  )}
                  {!card.hasArt ? <span>{local(ui.archivePending, lang)}</span> : null}
                </div>
                <div className="library-card-copy"><span>{card.number}</span><div><b>{local(card.name, lang)}</b><small>{card.name.en}</small></div><i>↗</i></div>
              </button>
              {expandedCard?.id === card.id ? (
                <InlineArchiveDetail card={card} orientation={expandedOrientation} lang={lang} onClose={() => setExpandedCard(null)} onOrientation={setExpandedOrientation} />
              ) : null}
            </Fragment>
          ))}
        </div>
      </section>
      </div>

      <footer>
        <div className="footer-mark"><i /><i /><span /></div>
        <div><h2>{local(ui.footer, lang)}</h2><p>{local(ui.footerNote, lang)}</p></div>
        <span>FAKE SUN TAROT<br />CIVILIZATIONAL ARCHIVE<br />SVAP—79</span>
      </footer>

      {selected ? <ArchiveModal card={selected} orientation={selectedOrientation} lang={lang} onClose={() => setSelected(null)} onOrientation={setSelectedOrientation} /> : null}
    </main>
  );
}
