import { assetPath } from "./asset-path";

export type Lang = "zh" | "en";

export type Localized = { zh: string; en: string };

export type TarotCard = {
  id: string;
  number: string;
  name: Localized;
  group: "major" | "fragments" | "rings" | "rifts" | "vessels" | "vacancy";
  groupName: Localized;
  archive: Localized;
  upright: Localized;
  reversed: Localized;
  question: Localized;
  keywords: Localized;
  image: string;
  hasArt: boolean;
};

const cardImage = (index: number) => assetPath(`/cards/${String(index).padStart(3, "0")}.webp`);

const majorRaw: Array<{
  number: string;
  zh: string;
  en: string;
  archiveZh: string;
  archiveEn: string;
  upZh: string;
  upEn: string;
  revZh: string;
  revEn: string;
  qZh: string;
  qEn: string;
  keysZh: string;
  keysEn: string;
}> = [
  { number: "0", zh: "失锚者", en: "The Unanchored", archiveZh: "从未被赠予太阳的人。他穿过所有仰望者之间，只接收光、热与未经命名的天空。", archiveEn: "One who was never given the sun. They move among upturned faces, receiving only light, heat, and an unnamed sky.", upZh: "不受既定叙事束缚；让原初感知带你进入未知，但保留对他人的谦逊。", upEn: "Freedom from inherited narratives; enter the unknown through primary perception while keeping humility toward others.", revZh: "差异正在变成孤立，或你把不相信误作优越。自由若没有关系，也会成为新的牢笼。", revEn: "Difference is hardening into isolation, or disbelief is being mistaken for superiority. Freedom without relation can become another cage.", qZh: "如果不先命名，你真正看见了什么？", qEn: "What do you actually see before naming it?", keysZh: "原初感知 · 未知 · 自由", keysEn: "primary perception · unknown · freedom" },
  { number: "I", zh: "造日者", en: "The Sunwright", archiveZh: "把分散的光、热、时间与情绪压缩成一个中心解释的人。创造在这里也是一种权力。", archiveEn: "The maker who compresses dispersed light, heat, time, and emotion into one central explanation. Creation here is also power.", upZh: "命名、整合并使混乱可用。你拥有把多种能力接入同一行动的条件。", upEn: "Name, integrate, and make disorder usable. You can connect different capacities into one act.", revZh: "解释被伪装成事实，证据被弯向既定结论。检查是谁控制了接口与命名权。", revEn: "An interpretation is masquerading as fact and evidence is being bent toward a conclusion. Ask who controls the interface and the right to name.", qZh: "你正在创造工具，还是创造服从？", qEn: "Are you creating a tool, or creating obedience?", keysZh: "命名 · 整合 · 权力", keysEn: "naming · integration · power" },
  { number: "II", zh: "静默协议", en: "The Silent Protocol", archiveZh: "知道系统存在，却以保护为名延迟公开的守门机制。沉默既可保存脆弱知识，也可剥夺知情。", archiveEn: "A gatekeeping mechanism that knows the system exists yet delays disclosure in the name of protection. Silence may shelter fragile knowledge or deny informed choice.", upZh: "等待、聆听与理解不可言说之物。现在需要的是辨认信号，而不是立刻公布结论。", upEn: "Wait, listen, and understand what cannot yet be said. Discern the signal before declaring a conclusion.", revZh: "制度性沉默正在替他人决定什么可以知道。保密已经越过照护，成为控制。", revEn: "Institutional silence is deciding what others may know. Secrecy has crossed from care into control.", qZh: "谁有权决定真相的时机？", qEn: "Who gets to decide the timing of truth?", keysZh: "隐秘知识 · 等待 · 知情权", keysEn: "hidden knowledge · waiting · informed consent" },
  { number: "III", zh: "母体", en: "The Womb of Light", archiveZh: "将生成太阳的语法写入下一代身体的文明母体。照护、繁衍与默认干预在此重叠。", archiveEn: "The civilizational womb that writes the grammar of sun-making into the next generation. Care, inheritance, and default intervention overlap.", upZh: "孕育、保护与丰盛；让一个尚未成熟的可能得到持续照料。", upEn: "Nurture, protection, and abundance; give a developing possibility sustained care.", revZh: "以爱之名塑造他人，遗产变成无法拒绝的程序。照护需要重新包含选择。", revEn: "Another is being shaped in the name of love, and inheritance becomes an unrefusable program. Care must make room for choice again.", qZh: "这份保护允许被保护者长成不同的人吗？", qEn: "Does this protection allow the protected to become different?", keysZh: "孕育 · 遗产 · 默认干预", keysEn: "nurture · inheritance · default intervention" },
  { number: "IV", zh: "日冕", en: "The Corona", archiveZh: "以太阳为中心建立边界、责任与公共秩序的结构。空王座提醒人们：中心也可能只是制度位置。", archiveEn: "A structure that builds boundaries, duties, and public order around the sun. The empty throne reminds us that a center may be only an institutional position.", upZh: "明确边界、承担责任、建立可预测的秩序。稳定现在是一项需要有人维护的工作。", upEn: "Set boundaries, accept responsibility, and establish predictable order. Stability is work that someone must maintain.", revZh: "中心崇拜正在使制度僵化，个体被当作秩序的耗材。权威需要可质疑的出口。", revEn: "Center worship is hardening institutions and treating people as consumables of order. Authority needs an avenue for challenge.", qZh: "这套秩序保护了谁，又固定了谁？", qEn: "Whom does this order protect, and whom does it pin in place?", keysZh: "边界 · 责任 · 中心", keysEn: "boundary · duty · center" },
  { number: "V", zh: "太阳教", en: "The Solar Church", archiveZh: "把技术、信仰与常识熔成同一种真理的机构。它让共同语言得以传承，也垄断什么算正常。", archiveEn: "An institution fusing technology, faith, and common sense into one truth. It transmits a shared language while monopolizing normality.", upZh: "向传统、导师与共同语言学习。先理解一套仪式为何长期有效。", upEn: "Learn from tradition, teachers, and shared language. Understand why a ritual has remained effective.", revZh: "知识垄断把服从定义为健康。你需要区分共同体智慧与不可质疑的教条。", revEn: "A knowledge monopoly is defining obedience as health. Separate communal wisdom from unquestionable dogma.", qZh: "这项传统仍在传承意义，还是只在复制权威？", qEn: "Is this tradition transmitting meaning, or merely reproducing authority?", keysZh: "传统 · 常识 · 教条", keysEn: "tradition · common sense · dogma" },
  { number: "VI", zh: "双重视界", en: "The Twin Horizon", archiveZh: "两个人面对同一片天空，却无法证明彼此看见的是同一个世界。亲密不必依赖完全一致。", archiveEn: "Two people face one sky but cannot prove they see the same world. Intimacy need not depend on perfect sameness.", upZh: "在差异中作出关系选择，和对方共同定义可生活的真实。", upEn: "Choose relationship across difference and co-author a reality that both can inhabit.", revZh: "一致正在代替亲密，感知差异被改造成思想问题。停止用同步度衡量爱。", revEn: "Agreement is replacing intimacy and perceptual difference is being treated as ideological failure. Stop measuring love by synchronization.", qZh: "你要的是被理解，还是被复制？", qEn: "Do you want to be understood, or duplicated?", keysZh: "关系 · 选择 · 感知差异", keysEn: "relationship · choice · perceptual difference" },
  { number: "VII", zh: "同步车", en: "The Synchronizer", archiveZh: "驾驭互相偏移的系统，使它们暂时朝向共同目标。推进力来自持续协调，而非彻底消除矛盾。", archiveEn: "A vehicle steering drifting systems toward a temporary common goal. Momentum comes from continuous coordination, not erased contradiction.", upZh: "集中意志、协调冲突并推进关键行动。为方向设置清晰的反馈。", upEn: "Focus will, coordinate conflict, and move the essential action forward. Build clear feedback into the route.", revZh: "强制同步造成反弹；你只剩速度，却忘了为何出发。", revEn: "Forced synchronization is producing backlash; speed remains, but the reason for travel has been forgotten.", qZh: "你控制的是方向，还是所有人的感受？", qEn: "Are you steering direction, or controlling everyone's experience?", keysZh: "推进 · 协调 · 强制同步", keysEn: "momentum · coordination · forced sync" },
  { number: "VIII", zh: "驯光", en: "Strength", archiveZh: "不摧毁共同幻象，也不向它屈服；以温柔自制承受复杂真相。", archiveEn: "Neither destroying the shared illusion nor submitting to it; holding a complex truth with gentle discipline.", upZh: "温柔的自制比压制更有力量。允许恐惧存在，但不让它决定行动。", upEn: "Gentle discipline is stronger than suppression. Let fear exist without allowing it to command the act.", revZh: "怀疑被压住后转化为麻木或过载。真正的坚强需要可恢复的节奏。", revEn: "Suppressed doubt is turning into numbness or overload. Real strength requires a recoverable rhythm.", qZh: "你能否承受矛盾，而不急着消灭其中一边？", qEn: "Can you bear contradiction without rushing to eliminate one side?", keysZh: "自制 · 承受 · 复杂真相", keysEn: "discipline · endurance · complex truth" },
  { number: "IX", zh: "夜航者", en: "The Night Voyager", archiveZh: "主动离开共同光源，寻找无需太阳也能前行的内在导航。", archiveEn: "A traveler who leaves the common light to find a way forward that does not require the sun.", upZh: "独处、求证并建立自己的导航坐标。暂时离群是为了更诚实地返回。", upEn: "Seek solitude, verify, and establish your own bearings. Leave temporarily so you can return more honestly.", revZh: "求证变成封闭，害怕同化使你拒绝一切连接。孤岛不会自动产生真相。", revEn: "Inquiry has become enclosure, and fear of assimilation rejects all connection. An island does not automatically produce truth.", qZh: "你是在寻找方向，还是在躲避关系？", qEn: "Are you seeking direction, or avoiding relationship?", keysZh: "独处 · 求证 · 内在导航", keysEn: "solitude · verification · inner navigation" },
  { number: "X", zh: "校准轮", en: "The Calibration Wheel", archiveZh: "让出生、同步、偏移与重置循环发生的自动系统。个体置身其中，却不能独占时机。", archiveEn: "An automated system cycling birth, synchronization, drift, and reset. The individual lives inside it but cannot own its timing.", upZh: "周期正在转向；识别可乘之势，也接受并非一切都由你控制。", upEn: "The cycle is turning. Use the available moment while accepting that not everything is yours to control.", revZh: "故障被反复重置而没有真正修复，你被算法推回原位。打断循环需要改动规则。", revEn: "Failure is repeatedly reset rather than repaired, returning you to the same position. Breaking the cycle requires changing the rule.", qZh: "哪一种重复被误称为命运？", qEn: "What repetition is being mistaken for fate?", keysZh: "周期 · 偏移 · 重置", keysEn: "cycle · drift · reset" },
  { number: "XI", zh: "共识裁决", en: "Consensus", archiveZh: "社会以多数人的同一证词判断真实。程序可以公平执行，却仍可能把差异定罪。", archiveEn: "Society judges reality through the matching testimony of the majority. Procedure may be consistent and still criminalize difference.", upZh: "让规则一致适用，并承担公共判断的后果。证据与责任需要同时被看见。", upEn: "Apply rules consistently and accept the consequences of public judgment. Evidence and responsibility must be visible together.", revZh: "程序正确掩盖伦理错误，多数正在把正常定义成唯一许可。", revEn: "Procedural correctness is hiding ethical failure, and the majority is turning normality into the only permission.", qZh: "一致的规则是否也看见了不一致的人？", qEn: "Does a consistent rule also see the inconsistent person?", keysZh: "公共判断 · 程序 · 多数暴力", keysEn: "public judgment · procedure · majority force" },
  { number: "XII", zh: "倒悬校准体", en: "The Suspended Calibrator", archiveZh: "以身体持续承受系统负荷，使公众看见稳定太阳的人类可信度传感器。纸面自愿不等于现实可退出。", archiveEn: "A human credibility sensor whose body carries system load so the public sees a stable sun. Voluntary on paper does not mean safely exitable in life.", upZh: "暂停并换位观看，理解共同现实真实由谁维持。接受必要的视角反转。", upEn: "Pause and reverse perspective to see who actually maintains shared reality. Accept the necessary inversion.", revZh: "奉献被神圣化，身份与医疗依赖使退出成为空文。不要再把被困称作牺牲。", revEn: "Devotion has been sanctified while identity and medical dependence make exit fictional. Stop calling entrapment sacrifice.", qZh: "谁的身体被藏在这份稳定下面？", qEn: "Whose body is hidden beneath this stability?", keysZh: "换位 · 身体成本 · 纸面退出", keysEn: "reversal · bodily cost · paper exit" },
  { number: "XIII", zh: "日落", en: "Death", archiveZh: "消失的不是光，而是一个中心解释。旧太阳熄灭后，真实光线仍从分布式来源抵达。", archiveEn: "What disappears is not light but a central explanation. After the old sun sets, real illumination still arrives from distributed sources.", upZh: "一个范式与身份已经结束，让不可逆的转化完成。你会失去名字，但不一定失去光。", upEn: "A paradigm and identity have ended. Let the irreversible transition complete; you may lose a name without losing the light.", revZh: "旧秩序已经死亡却被持续供能。对无名状态的恐惧正在延长腐朽。", revEn: "A dead order is still being powered. Fear of the unnamed is prolonging decay.", qZh: "当旧解释结束后，哪些真实仍然存在？", qEn: "When the old explanation ends, what realities remain?", keysZh: "结束 · 转化 · 无名状态", keysEn: "ending · transition · unnamed state" },
  { number: "XIV", zh: "分布之光", en: "Temperance", archiveZh: "把集中于单一中心的意义重新分流，让真实与可用叙事能够并存。", archiveEn: "Meaning concentrated in one center is redistributed so reality and usable narrative can coexist.", upZh: "调和多个真相，建立去中心但仍可协作的流路。整合不等于抹平。", upEn: "Reconcile several truths and build decentralized channels that still cooperate. Integration is not flattening.", revZh: "系统失衡来自对纯粹的执念。单一正确正在破坏原本可协商的差异。", revEn: "The system is unbalanced by an obsession with purity. One correctness is destroying negotiable difference.", qZh: "如何分配意义，才能不再制造唯一中心？", qEn: "How can meaning be distributed without manufacturing one center?", keysZh: "调和 · 分布 · 多重真实", keysEn: "temperance · distribution · plural reality" },
  { number: "XV", zh: "金色依赖", en: "The Golden Bond", archiveZh: "明知太阳可能是假的，却无法放弃被照亮的感觉。锁链既由制度固定，也被需要者握在手里。", archiveEn: "Knowing the sun may be false yet unable to abandon the feeling of illumination. The chain is fixed by institutions and held by those who need it.", upZh: "承认欲望、依附与权力交换，不再让隐藏的需要替你行动。", upEn: "Acknowledge desire, attachment, and power exchange so hidden needs no longer act for you.", revZh: "你正在识别依赖，但别把戒断或孤立浪漫化。自由也需要替代支持。", revEn: "Dependence is becoming visible, but do not romanticize withdrawal or isolation. Freedom also needs replacement support.", qZh: "你舍不得的是真相，还是被照亮的感觉？", qEn: "Are you holding the truth, or the feeling of being illuminated?", keysZh: "欲望 · 依附 · 戒断", keysEn: "desire · dependence · withdrawal" },
  { number: "XVI", zh: "双日故障", en: "The Twin Suns", archiveZh: "锚点溢出后，公共界面分裂出两个互相矛盾的太阳；真实影子的主方向却没有分成两套。", archiveEn: "After anchor overflow, the public interface splits into two contradictory suns while real shadows retain one primary direction.", upZh: "系统性崩塌让旧解释无法修补。真相不是温和出现，而是穿过结构闯入。", upEn: "Systemic collapse makes the old explanation unrepairable. Truth enters by breaking through the structure.", revZh: "故障已发生但仍未被承认。秘密坍塌正在延迟必要的撤离与重建。", revEn: "The failure has happened but remains unacknowledged. Secret collapse is delaying necessary evacuation and rebuilding.", qZh: "哪一个矛盾已经大到不能再称为误差？", qEn: "Which contradiction is now too large to call an error?", keysZh: "崩塌 · 矛盾证据 · 警报", keysEn: "collapse · conflicting evidence · alarm" },
  { number: "XVII", zh: "余辉", en: "The Afterglow", archiveZh: "中心消失后仍留在视网膜上的残像。希望不再来自宏大日轮，而来自可重复的小小照护。", archiveEn: "The retinal trace remaining after the center disappears. Hope no longer comes from a grand disc but from small, repeatable care.", upZh: "恢复、微小希望与不依赖中心的信任正在形成。让身体慢慢重新学习。", upEn: "Recovery, modest hope, and centerless trust are forming. Let the body learn again slowly.", revZh: "你可能沉迷残像，把创伤后的幻觉当作启示；也可能暂时看不见希望。", revEn: "You may be clinging to an afterimage and calling post-traumatic illusion revelation, or hope may simply be hard to see.", qZh: "当宏大保证消失后，什么仍值得信任？", qEn: "What remains trustworthy after the grand guarantee disappears?", keysZh: "恢复 · 微光 · 残像", keysEn: "recovery · faint light · afterimage" },
  { number: "XVIII", zh: "盲区", en: "The Blind Field", archiveZh: "系统无法解释、意识却会自动补全的区域。模糊既可能隐藏危险，也可能保存尚未命名的可能。", archiveEn: "A region the system cannot explain but the mind automatically completes. Ambiguity may hide danger or protect an unnamed possibility.", upZh: "承认感知不可靠，在暧昧中放慢判断。潜意识正传来未经校准的材料。", upEn: "Admit perception is unreliable and slow judgment inside ambiguity. The unconscious is sending uncalibrated material.", revZh: "疑云可能正在消散，也可能你已更深陷入自造证据。回到可重复的观察。", revEn: "Confusion may be clearing, or you may be deeper inside self-made evidence. Return to repeatable observation.", qZh: "你是在面对未知，还是替未知画上熟悉的圆？", qEn: "Are you facing the unknown, or drawing a familiar circle over it?", keysZh: "暧昧 · 补全 · 潜意识", keysEn: "ambiguity · completion · unconscious" },
  { number: "XIX", zh: "伪日", en: "The Fake Sun", archiveZh: "一场被所有人共同看见、并确实带来温暖的幻象。光热是真的，共同喜悦也是真的，隐性代价同样真实。", archiveEn: "An illusion seen by everyone that genuinely brings warmth. The light and shared joy are real, and so is the hidden cost.", upZh: "生命力、成功与有效的共同神话照亮此刻。享受它，同时记住系统需要维护者。", upEn: "Vitality, success, and an effective shared myth illuminate the moment. Enjoy it while remembering the system has maintainers.", revZh: "强迫乐观让受害者从明亮叙事中消失。幸福的成本必须重新进入画面。", revEn: "Compulsory optimism is erasing victims from the bright narrative. The cost of happiness must re-enter the image.", qZh: "这份真实的快乐由谁支付维护费？", qEn: "Who pays the maintenance cost of this genuine joy?", keysZh: "生命力 · 共同神话 · 隐性代价", keysEn: "vitality · shared myth · hidden cost" },
  { number: "XX", zh: "唤醒协议", en: "The Wake Signal", archiveZh: "让人意识到自己正在参与生成现实的信号。醒来不是退出一切，而是承担知情后的关系责任。", archiveEn: "A signal revealing that people participate in generating reality. Waking is not exiting everything; it is accepting relational responsibility after knowing.", upZh: "重新审视习惯，交换未经标准渲染的证据，并承担知道之后的行动。", upEn: "Re-examine habit, exchange unstandardized evidence, and act under the responsibility that knowledge creates.", revZh: "拒绝醒来，或把觉醒变成道德优越。知道真相却不改变关系，也是一种睡眠。", revEn: "Refusal to wake, or awakening turned into moral superiority. Knowing without changing relations is another form of sleep.", qZh: "知道以后，你愿意改变哪一种关系？", qEn: "After knowing, which relationship are you willing to change?", keysZh: "觉醒 · 证据 · 责任", keysEn: "awakening · evidence · responsibility" },
  { number: "XXI", zh: "无中心世界", en: "The Centerless World", archiveZh: "没有唯一太阳之后，不同社区仍在同一片真实光线下协商共同生活。完成不是无摩擦，而是愿意共担摩擦。", archiveEn: "After the single sun, different communities negotiate life under the same real light. Completion is not frictionlessness but willingness to share its cost.", upZh: "分布式秩序容许差异并持续协商。成熟意味着不再期待终极完成。", upEn: "Distributed order allows difference and continuous negotiation. Maturity no longer expects final completion.", revZh: "解构之后无力重建，地区现实彼此封闭。不要把分裂本身浪漫化。", revEn: "Deconstruction has not been followed by rebuilding, and regional realities are closing off. Do not romanticize fragmentation itself.", qZh: "没有唯一中心，你愿意为共同生活承担什么？", qEn: "Without one center, what will you carry for shared life?", keysZh: "分布式秩序 · 协商 · 成熟", keysEn: "distributed order · negotiation · maturity" },
];

export const majorCards: TarotCard[] = majorRaw.map((card, index) => ({
  id: `major-${card.number.toLowerCase()}`,
  number: card.number,
  name: { zh: card.zh, en: card.en },
  group: "major",
  groupName: { zh: "大阿卡纳", en: "Major Arcana" },
  archive: { zh: card.archiveZh, en: card.archiveEn },
  upright: { zh: card.upZh, en: card.upEn },
  reversed: { zh: card.revZh, en: card.revEn },
  question: { zh: card.qZh, en: card.qEn },
  keywords: { zh: card.keysZh, en: card.keysEn },
  image: cardImage(index),
  hasArt: true,
}));

const suitDefinitions = {
  fragments: {
    groupName: { zh: "光像组", en: "Fragments" },
    system: { zh: "愿景、创造冲动、信念传播与行动方向", en: "vision, creative impulse, belief transmission, and direction" },
    question: { zh: "是什么让你愿意抬头？", en: "What makes you willing to look up?" },
    titles: [
      ["火种", "The Spark"], ["两种天空", "Two Skies"], ["远距投影", "Distant Projection"], ["共同黎明", "Common Dawn"], ["争光", "Contest of Light"], ["被承认的太阳", "The Recognized Sun"], ["守住天顶", "Holding the Zenith"], ["光速传播", "Light-Speed Signal"], ["灼伤之后", "After the Burn"], ["负日者", "The Sun-Burdened"], ["光像信使", "Messenger of Fragments"], ["光像夜航者", "Voyager of Fragments"], ["光像校准者", "Calibrator of Fragments"], ["光像执日者", "Sunbearer of Fragments"],
    ],
  },
  rings: {
    groupName: { zh: "同步组", en: "Rings" },
    system: { zh: "情感连接、归属、共感与关系边界", en: "emotional connection, belonging, empathy, and relational boundaries" },
    question: { zh: "你与谁共享同一个太阳？", en: "With whom do you share the same sun?" },
    titles: [
      ["初次共感", "First Resonance"], ["双人校准", "Paired Calibration"], ["同步宴席", "The Sync Feast"], ["拒绝接入", "Refusal to Connect"], ["断环", "The Broken Ring"], ["旧日残像", "Old Afterimage"], ["七重投影", "Seven Projections"], ["主动脱网", "Voluntary Disconnect"], ["完满模拟", "Fulfilled Simulation"], ["万众同日", "One Sun for All"], ["同步信使", "Messenger of Rings"], ["同步夜航者", "Voyager of Rings"], ["同步校准者", "Calibrator of Rings"], ["同步执日者", "Sunbearer of Rings"],
    ],
  },
  rifts: {
    groupName: { zh: "裂隙组", en: "Rifts" },
    system: { zh: "协议漏洞、认知冲突、真相、怀疑与证据", en: "protocol flaws, cognitive conflict, truth, doubt, and evidence" },
    question: { zh: "哪一道裂缝正在迫使你思考？", en: "Which rift is forcing you to think?" },
    titles: [
      ["第一道裂缝", "The First Rift"], ["遮眼选择", "The Veiled Choice"], ["三重证词", "Three Testimonies"], ["静默维护", "Silent Maintenance"], ["赢得解释权", "Winning the Explanation"], ["越过盲区", "Crossing the Blind Field"], ["伪造记录", "The Altered Record"], ["认知闭环", "Cognitive Loop"], ["夜间校准", "Night Calibration"], ["协议终止", "Protocol Termination"], ["裂隙信使", "Messenger of Rifts"], ["裂隙夜航者", "Voyager of Rifts"], ["裂隙校准者", "Calibrator of Rifts"], ["裂隙执日者", "Sunbearer of Rifts"],
    ],
  },
  vessels: {
    groupName: { zh: "载体组", en: "Vessels" },
    system: { zh: "身体、能源、基础设施、劳动与资源分配", en: "bodies, energy, infrastructure, labor, and resource allocation" },
    question: { zh: "谁在用身体支付这束光？", en: "Whose body pays for this light?" },
    titles: [
      ["真实热源", "The Real Heat Source"], ["负载平衡", "Load Balance"], ["共同建造", "Common Construction"], ["封存能源", "Stored Energy"], ["无光区", "The Lightless Zone"], ["配给", "Ration"], ["长期培育", "Long Cultivation"], ["校准劳动", "Calibration Labor"], ["自持光源", "Self-Sustained Light"], ["代际协议", "Intergenerational Protocol"], ["载体信使", "Messenger of Vessels"], ["载体夜航者", "Voyager of Vessels"], ["载体校准者", "Calibrator of Vessels"], ["载体执日者", "Sunbearer of Vessels"],
    ],
  },
} as const;

const ranks = [
  { number: "1", zh: "力量刚刚出现，仍保留开放可能。先确认它的真实来源，再决定如何命名。", en: "The force has just appeared and remains open. Verify its real source before deciding how to name it.", upZh: "接受这份新资源，让它以最小可行的方式进入现实。", upEn: "Receive the new resource and give it the smallest workable form.", revZh: "潜能被堵塞或被过早神圣化；回到最初的物理条件。", revEn: "Potential is blocked or sanctified too early; return to the initial material conditions." },
  { number: "2", zh: "两种可行现实并置，选择取决于你愿意承担哪一种代价。", en: "Two workable realities stand together; the choice depends on which cost you will carry.", upZh: "比较、协商并作出有意识的选择。", upEn: "Compare, negotiate, and choose deliberately.", revZh: "犹豫正被假装成平衡，或一个选项从未真正被允许。", revEn: "Indecision is posing as balance, or one option was never truly permitted." },
  { number: "3", zh: "力量进入协作与扩散阶段，开始产生超出个人范围的后果。", en: "The force enters collaboration and transmission, producing consequences beyond the individual.", upZh: "让不同角色贡献专业能力，并等待远端反馈。", upEn: "Let different roles contribute expertise and wait for distant feedback.", revZh: "协作停在表面，劳动与功劳的分配正在失真。", revEn: "Collaboration is superficial; labor and recognition are being distributed falsely." },
  { number: "4", zh: "结构暂时稳定，人们可以停下、庆祝或保存成果。稳定也可能变成封闭。", en: "The structure is temporarily stable, allowing rest, celebration, or preservation. Stability may also become enclosure.", upZh: "确认边界，享受已经建立的安全。", upEn: "Confirm boundaries and enjoy the safety already built.", revZh: "保护正在变成拒绝流动，安全感需要重新通风。", revEn: "Protection is becoming refusal of movement; safety needs circulation again." },
  { number: "5", zh: "冲突或匮乏暴露了系统如何定义资格、胜利与失败。", en: "Conflict or scarcity reveals how the system defines eligibility, victory, and failure.", upZh: "承认眼前的损失，寻找真实可用的支援。", upEn: "Acknowledge the loss and seek support that is materially usable.", revZh: "所谓缺陷可能是制度命名；重新组织互助与解释权。", revEn: "The alleged defect may be an institutional label; reorganize mutual aid and the right to explain." },
  { number: "6", zh: "力量获得公共确认并开始分配。认可可以赋能，也会制造依赖与等级。", en: "The force gains public recognition and enters distribution. Recognition can empower while creating hierarchy and dependence.", upZh: "接收合理的认可，并让资源继续流动。", upEn: "Receive deserved recognition and keep resources circulating.", revZh: "奖赏被用于控制，或你把公共认可误认成真实性。", revEn: "Reward is being used as control, or public recognition is being mistaken for truth." },
  { number: "7", zh: "成果面临压力测试，需要守住边界、复核证据或耐心等待。", en: "The result faces a stress test, requiring defended boundaries, reviewed evidence, or patience.", upZh: "坚持经过验证的立场，同时保留修正接口。", upEn: "Hold the verified position while keeping an interface for revision.", revZh: "防守耗尽资源，或长期等待已成为拖延。", revEn: "Defense is exhausting resources, or long waiting has become delay." },
  { number: "8", zh: "重复、速度或主动离开使力量发生位移。过程需要节奏与身体承受力。", en: "Repetition, speed, or deliberate departure moves the force. The process demands rhythm and bodily capacity.", upZh: "让行动形成稳定流路，专注于可重复的技能。", upEn: "Build a stable channel for action and focus on repeatable skill.", revZh: "速度制造噪声，重复劳动失去意义，或离开没有替代基础。", revEn: "Speed creates noise, repetition loses meaning, or departure lacks replacement infrastructure." },
  { number: "9", zh: "力量接近成熟，却把疲惫、愿望与自持能力一同带到表面。", en: "The force nears maturity, bringing fatigue, desire, and self-sufficiency to the surface together.", upZh: "承认已经拥有的能力，也照顾留下的灼伤。", upEn: "Acknowledge what you can now sustain and care for the remaining burn.", revZh: "满足只是模拟，警戒变成长期紧绷；恢复真实需要。", revEn: "Fulfillment is simulated or vigilance has become chronic tension; recover the actual need." },
  { number: "10", zh: "个人力量进入制度与代际层，丰盛和负担都被放大并传递。", en: "Personal force enters institutional and intergenerational scale, amplifying and transmitting both abundance and burden.", upZh: "看见完整系统，分配责任并为下一代留下可退出路径。", upEn: "See the whole system, distribute duty, and leave an exit path for the next generation.", revZh: "繁荣建立在过度负载或完美同化上；停止把成本向下转移。", revEn: "Prosperity rests on overload or perfect assimilation; stop passing the cost downward." },
  { number: "M", zh: "信使第一次接触这股力量，以好奇带来尚未成熟的消息。", en: "The Messenger first encounters the force, carrying an immature message through curiosity.", upZh: "提问、学习并允许小规模试验。", upEn: "Ask, learn, and permit a small experiment.", revZh: "消息未经验证，敏感变成投射；先建立基本判断。", revEn: "The message is unverified and sensitivity becomes projection; build basic judgment first." },
  { number: "N", zh: "夜航者让这股力量移动、扩张，速度会把意图放大成行动后果。", en: "The Voyager sets the force in motion and expansion, turning intention into consequence through speed.", upZh: "带着明确方向出发，让行动接受现实反馈。", upEn: "Move with clear direction and let action meet real feedback.", revZh: "冲锋正在失控，理想化目标遮蔽沿途身体。", revEn: "The charge is losing control; an idealized goal is hiding the bodies along the route." },
  { number: "C", zh: "校准者承载并调节这股力量，使它能够滋养他人而非迅速耗尽。", en: "The Calibrator carries and regulates the force so it can sustain others rather than burn out quickly.", upZh: "容纳复杂输入，以清醒照护建立持续性。", upEn: "Hold complex input and build continuity through lucid care.", revZh: "承载过量噪声，照护者自身被系统隐去。", revEn: "Too much noise is being carried and the caregiver is disappearing from the system." },
  { number: "S", zh: "执日者决定这股力量如何进入公共规则，因此权力必须与分配责任绑定。", en: "The Sunbearer decides how the force becomes public rule, so authority must bind itself to distributive responsibility.", upZh: "建立可质疑、可修正并能照顾边界的秩序。", upEn: "Establish an order that can be challenged, revised, and bounded with care.", revZh: "权威把自己的偏好伪装成共同太阳。让决策重新接受监督。", revEn: "Authority disguises its preference as the common sun. Return decisions to oversight." },
];

export const minorCards: TarotCard[] = Object.entries(suitDefinitions).flatMap(([group, suit], suitIndex) =>
  suit.titles.map(([zh, en], index) => {
    const rank = ranks[index];
    const deckIndex = majorRaw.length + suitIndex * suit.titles.length + index;
    return {
      id: `${group}-${index + 1}`,
      number: rank.number,
      name: { zh, en },
      group: group as TarotCard["group"],
      groupName: suit.groupName,
      archive: {
        zh: `这是一份关于${suit.system.zh}的日常档案。${rank.zh}`,
        en: `A daily archive of ${suit.system.en}. ${rank.en}`,
      },
      upright: { zh: rank.upZh, en: rank.upEn },
      reversed: { zh: rank.revZh, en: rank.revEn },
      question: suit.question,
      keywords: { zh: `${zh} · ${suit.groupName.zh} · ${rank.number}`, en: `${en} · ${suit.groupName.en} · ${rank.number}` },
      image: cardImage(deckIndex),
      hasArt: true,
    };
  }),
);

export const vacancyCard: TarotCard = {
  id: "vacancy",
  number: "∅",
  name: { zh: "空位", en: "The Vacancy" },
  group: "vacancy",
  groupName: { zh: "空位牌", en: "Vacancy" },
  archive: {
    zh: "把错误的东西放在了中心。",
    en: "Something false has been placed at the center.",
  },
  upright: {
    zh: "抽到空位牌表示，问题里藏着一个还没有被证实的假设，该假设可能并不成立。",
    en: "Drawing The Vacancy means the question contains an unverified assumption that may not hold.",
  },
  reversed: {
    zh: "抽到空位牌表示，问题里藏着一个还没有被证实的假设，该假设可能并不成立。",
    en: "Drawing The Vacancy means the question contains an unverified assumption that may not hold.",
  },
  question: {
    zh: "被放在中心的前提，真的成立吗？",
    en: "Does the premise placed at the center actually hold?",
  },
  keywords: {
    zh: "空位 · 错误中心 · 未证实假设",
    en: "vacancy · false center · unverified assumption",
  },
  image: "",
  hasArt: true,
};

export const tarotCards: TarotCard[] = [...majorCards, ...minorCards, vacancyCard];
