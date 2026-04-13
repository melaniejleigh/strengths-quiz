import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";

/* ---- DOMAINS ---- */
var DOMAINS = {
  executing: { name: "Executing", color: "#7C3AED", themes: ["achiever","arranger","belief","consistency","deliberative","discipline","focus","responsibility","restorative"] },
  influencing: { name: "Influencing", color: "#DC2626", themes: ["activator","command","communication","competition","maximizer","self_assurance","significance","woo"] },
  relationship_building: { name: "Relationship Building", color: "#2563EB", themes: ["adaptability","connectedness","developer","empathy","harmony","includer","individualization","positivity","relator"] },
  strategic_thinking: { name: "Strategic Thinking", color: "#059669", themes: ["analytical","context","futuristic","ideation","input","intellection","learner","strategic"] },
};
var DO = ["executing","influencing","relationship_building","strategic_thinking"];

/* ---- THEMES ---- */
var TH = {
  achiever: { n: "Achiever", d: "executing", desc: "You have a constant internal drive to get things done. You take immense satisfaction in being busy and productive.",
    availableTendency: "stay productive, keep pace, and bring energy to steady output",
    awarenessCue: "the work is stalling because no one is pushing it toward completion",
    coreContext: "there is real work to finish and forward movement to protect",
    coreResult: "turn effort into visible results",
    defaultTendency: "meaning, quality, strategy, or people",
    introAction: "drive",
    introObject: "meaningful work toward completion",
    introPayoff: "so progress is visible and momentum stays alive",
    investmentMove: "build recovery and prioritization into your productivity so motion stays tied to what matters",
    lowDefault: "generate steady output for its own sake",
    lowMiss: "when a situation needs more stamina, follow-through, or visible productivity",
    lowRisk: "drift, underexecution, or too much emphasis on meaning without enough movement",
    naturalTendency: "push for output, momentum, and visible progress",
    overuseCost1: "making rest, reflection, or recovery feel suspicious",
    overuseCost2: "creating resentment, burnout, or dependency",
    overusePattern1: "you may overvalue busyness and undervalue quieter but important work",
    overusePattern2: "you may become the engine for everyone else",
    overuseTrigger1: "when effort becomes tied too tightly to identity",
    overuseTrigger2: "when you keep carrying more simply because you can",
    partnershipCue: "pairing with people who naturally create momentum, pace, and completion pressure",
    supportBenefit: "maintain momentum without forcing yourself to manufacture it alone",
    supportCondition: "the work needs stronger pace, completion energy, or execution discipline",
    supportPartner: "people who naturally create pace and keep things moving",
    supportStructure: "deadlines, accountability, clear deliverables, or external momentum",
    themePriority: "pure output and visible productivity",
    underuseAdvantage: "sustained effort and follow-through",
    underuseCost: "slowing progress that could have been steadier",
    underuseMiss: "work can lose pace or consistency",
    atWork: "You are the engine. You take on more than your share, stay late, come in early. When there is a gap in capacity, you fill it before anyone asks. Your output is consistently higher than your peers and you set the pace for what productivity looks like.",
    atBest: "You create momentum on every account you touch. People trust you to deliver because you always do. Your energy is contagious and your work ethic gives the team confidence that things will get done.",
    leanIn: "Track your wins visibly, not just for recognition but so you can see the patterns in where your drive produces the most impact. Volunteer for the high-output, high-stakes moments where your stamina gives the team an edge. Set stretch goals for yourself and share them with your manager so they can point your engine at the right targets.",
    thrive: "You thrive when there is something to accomplish and a reason to keep moving. Productivity energizes you, and you feel most like yourself when your effort is turning into visible progress.",
    blindSpots: ["Your drive can make rest feel suspicious and slower people feel vaguely irritating, even when they are not actually underperforming. Because effort is so tied to your identity, you may overvalue busyness and undervalue reflection, recovery, or work that is important but less visibly productive.", "You can also become the person who keeps carrying more simply because you can. That may make you look dependable, but it can quietly create resentment, burnout, and a team culture where other people let your engine compensate for their lack of urgency."],
    actionItems: ["**Aim your drive at outcomes, not just output.** Being productive is satisfying, but not every finished task matters equally. Make sure your energy is going toward the work that actually moves the business, the team, or your goals forward.", "**Track what is enough.** Your instinct is to keep going, even after the important thing is already done well. Build clearer stopping points so your stamina stays an asset instead of turning into overwork that nobody asked for.", "**Do not automatically absorb every gap.** Just because you can pick up the slack does not mean you should. When you always compensate for other people's inconsistency, you protect the short term but reinforce the long-term problem.", "**Let rest count as part of performance.** You are not weaker for needing recovery, you are just human. Treat rest like maintenance for the machine rather than proof that the machine is failing.", "**Celebrate progress before you move the goalpost.** You are quick to focus on what is next, which can make wins feel strangely brief. Taking a minute to register what you actually completed makes your ambition more sustainable and your life less like an endless treadmill."] },
  arranger: { n: "Arranger", d: "executing", desc: "You can organize, but you also have flexibility. You figure out how all the pieces can be arranged for maximum productivity.",
    availableTendency: "step into complexity and reorganize people, priorities, or resources into something more workable",
    awarenessCue: "the current setup is making the work harder than it needs to be",
    coreContext: "there are many moving parts and no obvious clean path",
    coreResult: "make complexity function more effectively",
    defaultTendency: "clear lanes, stronger structure, or fewer simultaneous variables",
    introAction: "reorganize",
    introObject: "moving pieces into a better configuration",
    introPayoff: "so complexity becomes workable instead of overwhelming",
    investmentMove: "decide earlier when reconfiguration is improving the system and when it is just keeping motion alive",
    lowDefault: "dynamically reshuffle people and resources in the middle of complexity",
    lowMiss: "when a situation needs more orchestration, flexibility, or reconfiguration",
    lowRisk: "overreliance on static structure even when a smarter arrangement is available",
    naturalTendency: "coordinate variables, reshuffle resources, and make complex systems work better",
    overuseCost1: "creating instability, shifting expectations, or a plan that never settles",
    overuseCost2: "making the system depend on your flexibility instead of building scalable structure",
    overusePattern1: "you may keep reconfiguring longer than others can follow",
    overusePattern2: "you may take on too much hidden orchestration work yourself",
    overuseTrigger1: "when you can see too many possible combinations",
    overuseTrigger2: "when you become the central switchboard for everything",
    partnershipCue: "relying on people who naturally coordinate complexity and optimize configurations",
    supportBenefit: "manage moving parts without becoming the human switchboard",
    supportCondition: "the situation is messy enough that the current setup is not working",
    supportPartner: "people who naturally enjoy juggling complexity and restructuring systems",
    supportStructure: "visible dependencies, staffing maps, or clear coordination tools",
    themePriority: "dynamic coordination and real-time reconfiguration",
    underuseAdvantage: "flexible orchestration and better configuration",
    underuseCost: "missing easier, smarter, or more functional arrangements",
    underuseMiss: "teams may stick with clunky setups longer than they need to",
    atWork: "You see the whole board. When there are multiple clients, competing deadlines, and shifting priorities, you instinctively rearrange the pieces to make it work. You think in configurations, not just task lists.",
    atBest: "You bring calm to chaos. You make the complex feel manageable. You find combinations of people and resources that others would not have seen, and you do it fast enough that the team barely notices the complexity you just absorbed.",
    leanIn: "Seek out the most operationally complex accounts and projects. Ask to be involved in staffing conversations and project planning, because your ability to see how the pieces fit is one of the firm's biggest assets. When things change, lean into the reconfiguration rather than resisting it. That is where you shine.",
    thrive: "You thrive when there are multiple moving pieces to coordinate and a better configuration to find. Complexity does not overwhelm you, it activates you, especially when you can reorganize people, priorities, and resources into something that works.",
    blindSpots: ["Because you see so many possible combinations, you can keep rearranging longer than other people can comfortably follow. What feels to you like smart adaptation can feel to others like instability, shifting expectations, or a plan that never fully settles.", "You may also take on too much orchestration yourself. When you become the central switchboard for everything, people rely on your flexibility instead of building their own structure, and you end up carrying hidden coordination work that is hard to scale."],
    actionItems: ["**Reconfigure with a reason, not just because you can.** Your gift is making the system work better, but not every tweak is worth the disruption it creates. Be clear about what problem the reconfiguration is solving before you move the pieces around again.", "**Show people the logic behind the shuffle.** You can adapt faster than most people can process. A quick explanation of why priorities changed or why roles shifted helps others experience your flexibility as strategic rather than chaotic.", "**Build systems that do not depend entirely on you.** Your instinct is to manage complexity in real time, but that can make you the bottleneck without realizing it. Create repeatable structures so the team benefits from your mind even when you are not actively juggling every variable.", "**Use your range to improve staffing and collaboration.** You often see combinations of people and resources that others miss. Speak those observations out loud, because your pattern recognition is wasted if it stays trapped in your head.", "**Do not confuse usefulness with centrality.** You do not need to be in the middle of everything to be valuable. Sometimes your highest-leverage move is designing a better setup and then stepping back enough to let it run."] },
  belief: { n: "Belief", d: "executing", desc: "You have core values that are enduring. Out of these values emerges a defined purpose for your life.",
    availableTendency: "bring conviction, steadiness, and a stronger sense of purpose into decisions",
    awarenessCue: "the room is making a technically sound decision that feels morally thin",
    coreContext: "the question is not just what works, but what matters",
    coreResult: "keep decisions grounded in values rather than convenience alone",
    defaultTendency: "strategy, adaptability, outcomes, or pragmatism",
    introAction: "anchor",
    introObject: "work in what feels real, right, and worth doing",
    introPayoff: "so effort stays connected to purpose instead of drifting into the hollow",
    investmentMove: "keep testing whether your convictions still match the reality you are serving",
    lowDefault: "explicitly lead through values-first conviction",
    lowMiss: "when a decision needs more purpose, principle, or clarity about what is worth standing for",
    lowRisk: "overemphasis on efficiency, strategy, or outcomes without enough grounding in meaning",
    naturalTendency: "orient around values, meaning, and what feels worth standing for",
    overuseCost1: "narrowing flexibility in situations that contain real complexity",
    overuseCost2: "preserving meaning in theory while ignoring reality in practice",
    overusePattern1: "you may become rigid or less willing to engage nuance",
    overusePattern2: "you may stay committed to people, missions, or organizations after the fit is gone",
    overuseTrigger1: "when your first moral read hardens too quickly",
    overuseTrigger2: "when loyalty and identity get tightly fused",
    partnershipCue: "leaning on people who naturally keep purpose, mission, and principle in view",
    supportBenefit: "make stronger value-based decisions without needing conviction to be your first reflex",
    supportCondition: "the work needs more clarity about what matters and why",
    supportPartner: "people who naturally keep purpose and principle visible",
    supportStructure: "mission language, decision principles, or explicit values criteria",
    themePriority: "values-based conviction and mission-first steadiness",
    underuseAdvantage: "purpose-based clarity and conviction",
    underuseCost: "weakening commitment, coherence, or moral steadiness",
    underuseMiss: "teams can become overly transactional or efficient without enough meaning",
    atWork: "You are the moral compass. You care deeply about whether the work matters, not just whether it ships. You bring a sense of purpose that anchors the team during long stretches and tough cycles.",
    atBest: "Your values give you clarity when everything else is ambiguous. You make decisions quickly because your compass is always pointing the same direction. People trust you because they know exactly where you stand, and that consistency is rare.",
    leanIn: "Actively connect the work to the mission, out loud, for other people. When you feel energized by a project, name why. When something feels misaligned, say so early rather than letting it build. Your values are your superpower, so make them visible to the team rather than carrying them quietly.",
    thrive: "You thrive when your work feels connected to something real, important, and worth standing for. You do your best work when your values are not just private convictions, but active forces shaping how you decide, lead, and contribute.",
    blindSpots: ["Your conviction gives you clarity, but it can also make you rigid when a situation is more complex than your first moral read allows. Others may experience you as principled and grounded, or as quietly immovable when they are trying to explore tradeoffs, nuance, or competing priorities.", "You may also stay loyal to missions, people, or organizations long after the reality no longer matches the values you thought you were serving. When identity and purpose get tightly fused, it can be hard to admit that something meaningful to you is no longer aligned in practice."],
    actionItems: ["**Make your values visible in useful ways.** Do not assume people know what matters to you or why you are pushing on something. When you name the principle at stake clearly, your conviction becomes a source of alignment rather than just personal intensity.", "**Stay principled without becoming brittle.** A strong value system should give you direction, not trap you in one interpretation forever. Leave room for the possibility that the right answer may still require nuance, timing, or a more complicated path than your first instinct prefers.", "**Choose work that your values can actually sustain.** You are not built for purely transactional effort for very long. The more your responsibilities connect to something you genuinely believe in, the more resilient, focused, and effective you become.", "**Notice where loyalty is outliving reality.** Your commitment is admirable, but it can keep you attached to people or systems that no longer deserve it. Periodically ask whether you are being faithful to the mission itself or just to the version of it you first fell in love with.", "**Let purpose support your life, not consume it.** Meaning matters to you, but not every good life decision has to serve a grand cause. Sometimes it is enough that something is healthy, honest, and deeply right for you."] },
  consistency: { n: "Consistency", d: "executing", desc: "You are keenly aware of the need to treat people the same. You crave stable routines and clear rules.",
    availableTendency: "create clearer expectations and more even-handed structure",
    awarenessCue: "people are making up the rules as they go, and trust is starting to fray",
    coreContext: "fairness matters and people need to know the rules of the game",
    coreResult: "reduce arbitrariness and build trust through clarity",
    defaultTendency: "flexibility, nuance, speed, or individualized judgment",
    introAction: "create",
    introObject: "clear and fair systems",
    introPayoff: "so people know the rules and trust the structure",
    investmentMove: "keep asking whether sameness is actually serving fairness in the moment",
    lowDefault: "standardize, equalize, and rely on fairness through structure",
    lowMiss: "when a situation needs clearer rules, equal treatment, or more stable process",
    lowRisk: "overreliance on case-by-case judgment without enough consistency",
    naturalTendency: "care about fairness, equal standards, and systems people can count on",
    overuseCost1: "making necessary nuance harder than it needs to be",
    overuseCost2: "protecting sameness at the expense of better judgment",
    overusePattern1: "you may resist exceptions even when they are justified",
    overusePattern2: "you may flatten meaningful differences in need, talent, or circumstance",
    overuseTrigger1: "when sameness starts to feel safer than judgment",
    overuseTrigger2: "when fairness becomes defined too narrowly as equal treatment",
    partnershipCue: "using partners who naturally create fair standards and stable systems",
    supportBenefit: "increase trust without needing standardization to be your first instinct",
    supportCondition: "the group is feeling uneven treatment or avoidable ambiguity",
    supportPartner: "people who naturally build stable, fair, and predictable systems",
    supportStructure: "policies, decision rules, or consistent process design",
    themePriority: "fairness-by-structure and even-handed standards",
    underuseAdvantage: "stable standards and trustworthy fairness",
    underuseCost: "weakening trust in the system",
    underuseMiss: "teams may tolerate too much inconsistency, favoritism, or avoidable ambiguity",
    atWork: "You make sure the rules are applied fairly. You build processes, standardize templates, and advocate for equal treatment. You notice when someone is getting a different deal, and you ask why.",
    atBest: "You create fairness and predictability. People know what to expect from you and from the systems you build. Teams run better because of the structures you put in place, and people feel safe because they know the ground rules are stable.",
    leanIn: "Own the systems. Volunteer to build the SOPs, the onboarding processes, the internal playbooks. Position yourself as the person who ensures quality and fairness across accounts. When you see inconsistencies, frame your observations as opportunities to improve rather than complaints.",
    thrive: "You thrive when expectations are clear, systems are fair, and people know the rules of the game. You do your best work in environments where standards are applied evenly and structure creates trust instead of confusion.",
    blindSpots: ["Your commitment to fairness can make you skeptical of exceptions, even when an exception is justified. What feels to you like protecting equity can sometimes come across as rigid or overly standardized when a situation actually calls for discretion, context, or a more individualized response.", "You may also spend so much energy making things even that you flatten important differences in talent, need, urgency, or circumstance. Equal treatment is not always the same as effective treatment, and if you are not careful, fairness can become a shield against the messier work of judgment."],
    actionItems: ["**Build systems people can trust.** Your instinct for fairness is one of your biggest assets, especially in environments where inconsistency breeds resentment. Use it to create processes, expectations, and standards that people experience as clear, stable, and credible.", "**Distinguish fairness from sameness.** The goal is not to treat every situation identically, it is to treat people justly and transparently. When an exception is warranted, explain the logic so your flexibility does not undermine the trust you work so hard to build.", "**Use consistency to reduce noise, not nuance.** Strong systems should make better judgment easier, not replace it. Leave room for context when the facts genuinely support a different approach.", "**Speak up when the rules are unevenly applied.** You notice double standards quickly, and that awareness is valuable. Frame what you see as a structural issue to solve, not just a frustration to name, so your instinct becomes a leadership contribution rather than a private annoyance.", "**Let predictability support your life, not harden it.** Routines and standards steady you, but they should not become a reason to resist every change. The healthiest version of your strength creates order people can rely on, without turning flexibility into a threat."] },
  deliberative: { n: "Deliberative", d: "executing", desc: "You take serious care in making decisions. You anticipate obstacles and think through what could go wrong.",
    availableTendency: "bring caution, judgment, and better risk awareness to decisions",
    awarenessCue: "the room is moving faster than the risk profile justifies",
    coreContext: "the stakes are real and the downside matters",
    coreResult: "protect the work from avoidable mistakes",
    defaultTendency: "pace, experimentation, or faster movement",
    introAction: "anticipate",
    introObject: "risk before taking the next step",
    introPayoff: "so the move is smart, not just fast",
    investmentMove: "keep using your caution as discernment, not as a permanent brake",
    lowDefault: "slow down to scan downside before moving",
    lowMiss: "when a situation needs more caution, restraint, or risk awareness",
    lowRisk: "moving too quickly or too optimistically",
    naturalTendency: "think carefully, scan for downside, and prefer a measured move over a rushed one",
    overuseCost1: "slowing movement more than the situation requires",
    overuseCost2: "missing opportunities that were worth the calculated risk",
    overusePattern1: "you may seem guarded, hesitant, or harder to read than you intend",
    overusePattern2: "you may overestimate the cost of moving too soon and underestimate the cost of moving too late",
    overuseTrigger1: "when caution becomes the main lens through which everything gets filtered",
    overuseTrigger2: "when avoiding error starts to feel more important than timing",
    partnershipCue: "relying on people who naturally scan risk and slow down premature decisions",
    supportBenefit: "protect against avoidable mistakes without needing caution to drive everything",
    supportCondition: "the stakes have risen enough that the downside needs real attention",
    supportPartner: "people who naturally slow the room down and ask harder questions",
    supportStructure: "risk reviews, decision gates, or a pause that forces better judgment",
    themePriority: "measured caution and downside scanning",
    underuseAdvantage: "discernment, risk-scanning, and measured judgment",
    underuseCost: "exposing the work to avoidable risk",
    underuseMiss: "the room may move too quickly without fully considering downside",
    atWork: "You are the risk spotter. Before the team commits to a strategy, you have already thought through what could go wrong. You are careful with sensitive information, selective about trust, and thorough in your thinking.",
    atBest: "You protect the team from avoidable mistakes. You ask the questions no one else is asking. In high-stakes environments where one wrong move can be costly, your caution is one of the firm's most valuable assets.",
    leanIn: "Position yourself as the person who pressure-tests strategies before they go to the client. Offer to do the risk review, the compliance check, the 'what could go wrong' pass. Your thoroughness is not slowness, it is quality assurance. Make that role explicit rather than informal.",
    thrive: "You thrive when there is room to think carefully, anticipate risk, and make a smart move instead of a rushed one. You do your best work when judgment matters, stakes are real, and caution is treated as discernment rather than hesitation.",
    blindSpots: ["Your carefulness can protect people from avoidable mistakes, but it can also make you seem overly guarded, skeptical, or hard to read. Others may experience your restraint as wisdom, or as reluctance, pessimism, or a refusal to engage before certainty is available.", "You may also overestimate the cost of moving too soon and underestimate the cost of moving too late. In trying to avoid error, you can miss timing, momentum, or opportunities that would have been worth the calculated risk."],
    actionItems: ["**Use caution where it adds value.** Your ability to spot what could go wrong is a major asset, especially in high-stakes work. Focus that strength on the decisions, risks, and commitments that truly warrant scrutiny rather than applying the same level of caution to everything.", "**Name the risk clearly.** People benefit most from your judgment when you articulate what you are seeing, not just when you feel uneasy. The more specific you can be about the downside, likelihood, and consequence, the more actionable your caution becomes.", "**Decide what level of certainty is enough.** Waiting can feel responsible, but perfect information is rarely available. Define the threshold that would make a decision prudent, then move once that threshold is met instead of letting caution quietly become avoidance.", "**Let people earn trust in stages.** You do not need to throw your instincts out, but not everyone should have to break through a wall to work with you well. Small signals of openness can preserve your discernment without making collaboration feel unnecessarily guarded.", "**Notice where vigilance becomes exhaustion.** Being alert to problems can keep you sharp, but it can also keep your nervous system on duty all the time. Build places in your life where you do not have to scan so hard, because calm is not the same as carelessness."] },
  discipline: { n: "Discipline", d: "executing", desc: "You enjoy routine and structure. Your world is best described by the order you create.",
    availableTendency: "create structure, steadiness, and more reliable ways of working",
    awarenessCue: "the work is getting harder because nothing is organized clearly enough",
    coreContext: "the environment is messy enough that stronger order would reduce friction",
    coreResult: "make the work cleaner, more manageable, and more reliable",
    defaultTendency: "fluidity, improvisation, or looser structure",
    introAction: "create",
    introObject: "order, structure, and reliable routines",
    introPayoff: "so chaos does not get to run the day",
    investmentMove: "let structure serve the outcome instead of becoming the outcome",
    lowDefault: "build strong routines and maintain order automatically",
    lowMiss: "when a situation needs clearer structure, stronger prioritization, or more consistent process",
    lowRisk: "relying on flexibility in places where order would help more",
    naturalTendency: "build systems, routines, and clear priorities that keep things under control",
    overuseCost1: "making flexibility harder than it needs to be",
    overuseCost2: "making change harder than it needs to be",
    overusePattern1: "you may become overly rigid, particular, or controlling",
    overusePattern2: "you may resist experimentation because it looks messy before it looks useful",
    overuseTrigger1: "when disorder starts to feel more threatening than it is",
    overuseTrigger2: "when preserving order becomes more important than testing a better way",
    partnershipCue: "relying on people who naturally create and maintain clean systems",
    supportBenefit: "reduce chaos without needing structure to drive everything you do",
    supportCondition: "the mess is now costing more than the effort it would take to organize it",
    supportPartner: "people who naturally create order and maintain process discipline",
    supportStructure: "routines, checklists, visible priorities, or external systems",
    themePriority: "order, routine, and reliable process",
    underuseAdvantage: "reliable structure and stronger prioritization",
    underuseCost: "creating friction that stronger systems could have prevented",
    underuseMiss: "important work can stay needlessly chaotic or poorly organized",
    atWork: "You are the most organized person in the room. Your files are named correctly, your calendar is tight, your processes are documented. When shared systems fall apart, you are the one who notices and fixes them.",
    atBest: "You create the structure that lets everyone else do their best work. You reduce friction, eliminate confusion, and make the invisible work of organization visible. Things do not fall through the cracks on your watch.",
    leanIn: "Build systems for the team, not just yourself. Your organizational skills scale beautifully when you turn them outward. Offer to own the project management tools, the file structures, the status update cadences. The more of the firm's infrastructure runs through your systems, the more indispensable you become.",
    thrive: "You thrive when there is order, structure, and a clear way to stay on top of what matters. You do your best work when systems are reliable, priorities are visible, and your environment supports focus instead of creating unnecessary chaos.",
    blindSpots: ["Your need for structure can make disorder feel more threatening to you than it does to other people. What feels to you like basic responsibility can come across as rigid, controlling, or overly particular when others are operating with more fluidity and still getting to a workable result.", "You may also spend so much energy maintaining order that you become resistant to experimentation, spontaneity, or any process that looks messy before it becomes effective. In trying to prevent things from slipping, you can accidentally make change harder than it needs to be."],
    actionItems: ["**Use structure to create freedom, not just control.** Your systems are most valuable when they reduce friction and make strong work easier for everyone. Build order that serves the outcome, not order for its own sake.", "**Distinguish what matters from what merely bothers you.** Not every inconsistency is a problem, and not every messy process is broken. Save your strongest energy for the gaps that actually create risk, confusion, or missed results.", "**Let people be different without assuming they are wrong.** Your way is often efficient and responsible, but it is not the only way to produce quality. The more you can separate preference from principle, the easier it becomes to collaborate without feeling quietly aggravated all the time.", "**Plan for change instead of resisting it by reflex.** Structure does not have to mean static. When something new is coming, use your strength to build the process around it rather than spending all your energy wishing the old process still worked.", "**Give yourself permission to be off duty sometimes.** You notice what is out of place almost automatically, which can make relaxing strangely hard. Create small zones in life where enough really is enough, because not everything needs optimization to be okay."] },
  focus: { n: "Focus", d: "executing", desc: "You can take a direction, follow through, and stay on track. You prioritize, then act.",
    availableTendency: "narrow attention, name the target, and keep the work aligned to what matters most",
    awarenessCue: "everything suddenly feels important, and the real priority is disappearing",
    coreContext: "the room is at risk of distraction, fake urgency, or too many simultaneous priorities",
    coreResult: "keep the work moving toward the right target",
    defaultTendency: "openness, responsiveness, or multiple possibilities",
    introAction: "lock onto",
    introObject: "the main objective",
    introPayoff: "so the work stays pointed instead of scattering",
    investmentMove: "keep your target discipline strong, but leave some room for ideas that need more runway",
    lowDefault: "narrow quickly to one target and protect it hard",
    lowMiss: "when the work needs stronger prioritization or better protection from distraction",
    lowRisk: "staying too open, too diffuse, or too easily pulled off target",
    naturalTendency: "orient around the goal, protect attention, and keep priorities from drifting",
    overuseCost1: "missing possibilities that needed more room before their value became clear",
    overuseCost2: "sacrificing important but less target-shaped realities",
    overusePattern1: "you may cut off ideas or side paths too early",
    overusePattern2: "you may treat relationships, recovery, or creativity like interruptions",
    overuseTrigger1: "when protecting the goal becomes more important than exploring the field",
    overuseTrigger2: "when progress toward the objective becomes the only thing that counts",
    partnershipCue: "relying on people who naturally protect focus and keep the work on target",
    supportBenefit: "protect what matters without needing to narrow everything yourself",
    supportCondition: "the group is getting noisy, scattered, or pulled into side quests",
    supportPartner: "people who naturally keep the group aligned to the main objective",
    supportStructure: "explicit priorities, visible goals, or a decision about what not to do",
    themePriority: "directional narrowing and objective protection",
    underuseAdvantage: "sharper prioritization and stronger directional clarity",
    underuseCost: "diluting energy that should have gone to the main objective",
    underuseMiss: "the work can scatter across too many competing demands",
    atWork: "You keep the team on track. When conversations drift, you bring them back. When priorities multiply, you cut through to the one that matters most. You are disciplined about where you spend your time and protective of your attention.",
    atBest: "You accomplish more than people who work longer hours because every minute is pointed at the goal. You help teams avoid scope creep and stay oriented toward outcomes. Your clarity of purpose is a gift to every project you touch.",
    leanIn: "Be the person who names the priority. In kickoff meetings, in strategy sessions, in Slack threads that are drifting, be the one who says 'the one thing that matters here is...' That instinct is incredibly valuable and most people do not have it. Also, protect your focused time aggressively, because that is where your best work happens.",
    thrive: "You thrive when the goal is clear, the priorities are visible, and your attention can lock onto what matters most. You do your best work when there is a target worth aiming at and enough structure to protect you from noise, drift, and needless distraction.",
    blindSpots: ["Your clarity can be a gift to a team, but it can also make you impatient with exploration, side paths, or anything that does not obviously serve the goal. Others may experience you as disciplined and sharp, or as narrow, dismissive, and too quick to cut off ideas that need a little more room before their value becomes clear.", "You may also overidentify with progress toward the target and underweight what is being lost along the way. Relationships, recovery, creativity, and emerging opportunities can all start to feel like interruptions when they do not fit neatly inside the current objective."],
    actionItems: ["**Name the priority out loud.** One of the best uses of your strength is helping people cut through clutter and remember what actually matters. When a group is drifting, your ability to define the objective can save time, energy, and a lot of fake urgency.", "**Recheck the target before you accelerate.** Your discipline is powerful, but it works best when the goal itself is still the right one. Build in moments to confirm that the objective remains relevant so your focus does not become efficient movement in the wrong direction.", "**Leave a small lane open for discovery.** Not every worthwhile thing announces itself as a priority at the start. Giving some space to emerging ideas will make you more adaptive without weakening the strength that makes you effective.", "**Do not mistake interruption for insignificance.** Some of what breaks your concentration is truly noise, and some of it is relationship, context, or information you actually need. The more carefully you make that distinction, the more useful your focus becomes to other people.", "**Let your life hold something besides the next milestone.** You are naturally future-aimed and outcome-driven, which makes you effective but can make satisfaction feel perpetually deferred. Build in moments where completion is allowed to feel complete before you move the target again."] },
  responsibility: { n: "Responsibility", d: "executing", desc: "You take psychological ownership of what you say you will do. You are committed to honesty and loyalty.",
    availableTendency: "create reliability, follow-through, and trust through ownership",
    awarenessCue: "tasks are being discussed, but no one is truly carrying them",
    coreContext: "commitments matter and people need to know someone will actually carry the work",
    coreResult: "make trust real through dependable action",
    defaultTendency: "flexibility, renegotiation, or looser commitment boundaries",
    introAction: "own",
    introObject: "what you said you would carry",
    introPayoff: "so trust is built through real follow-through",
    investmentMove: "keep honoring your word, but get better at renegotiating before overcommitting",
    lowDefault: "treat commitments as deeply personal obligations",
    lowMiss: "when stronger ownership, reliability, or follow-through would stabilize the work",
    lowRisk: "tolerating more flexibility or ambiguity around commitments than the situation can handle",
    naturalTendency: "take commitments seriously and feel personally accountable for doing what you said",
    overuseCost1: "becoming overloaded or resentful while everyone else relaxes",
    overuseCost2: "turning integrity into unnecessary burden",
    overusePattern1: "you may take on too much because you do not want standards to slip",
    overusePattern2: "you may struggle to renegotiate even when the reality has changed",
    overuseTrigger1: "when taking ownership starts to feel morally preferable to leaving it with someone else",
    overuseTrigger2: "when a commitment feels irreversible once spoken",
    partnershipCue: "leaning on people who naturally create trust through accountability and follow-through",
    supportBenefit: "raise trust without needing personal obligation to drive every decision",
    supportCondition: "the work is slipping because no one feels truly accountable for it",
    supportPartner: "people who naturally treat commitments as serious and follow them through",
    supportStructure: "clear ownership lines, commitment tracking, or explicit follow-up",
    themePriority: "personal ownership and follow-through",
    underuseAdvantage: "dependable ownership and stronger trust",
    underuseCost: "lowering reliability and trust",
    underuseMiss: "work can get dropped, blurred, or weakly owned",
    atWork: "You are the person everyone trusts with the high-stakes deliverable. When you say you will do something, it is done. You take ownership psychologically, not just operationally.",
    atBest: "You are the most reliable person in the building. Clients trust you. Partners trust you. Your word is your bond, and that creates a foundation of confidence for the entire team.",
    leanIn: "Let your reliability become your brand. Take on the commitments that matter most, the ones where follow-through is critical. Be selective about what you commit to so that everything you do touch gets your full attention. Your track record of delivery is one of the most valuable currencies in consulting. Spend it wisely.",
    thrive: "You thrive when ownership is clear, trust is real, and what you say you will do actually matters. You do your best work when people can rely on you, standards mean something, and your follow-through is treated as a strength rather than quietly taken for granted.",
    blindSpots: ["Your sense of obligation can make you say yes too quickly, carry more than is reasonable, and feel personally accountable for things that should never have become yours alone. What feels to you like integrity and dependability can turn into overcommitment, resentment, or a pattern where other people's lack of ownership gets quietly absorbed by you.", "You may also hold yourself to such a high standard of follow-through that flexibility starts to feel like failure. If circumstances change, you can struggle to renegotiate, delegate, or let go without feeling like you are breaking your word, even when adapting would actually be the more responsible move."],
    actionItems: ["**Treat your yes like a scarce resource.** Your reliability is valuable precisely because people believe it means something. The more carefully you commit, the more power and credibility your follow-through continues to carry.", "**Separate ownership from overownership.** It is one thing to take responsibility for your work, your promises, and your role. It is another to become the cleanup crew for every loose end in the system just because leaving it undone would bother you more than it bothers everyone else.", "**Renegotiate early when reality changes.** Adjusting a commitment is not the same as abandoning it. When you communicate clearly and early, you preserve trust far better than if you silently strain under something that no longer fits the facts.", "**Make your standards visible, not just personal.** You often hold yourself to an internal code that is stronger than what others realize. Naming expectations clearly can keep you from assuming everyone is operating from the same sense of duty when they are very much not.", "**Build a life that does not depend on being indispensable.** Being the dependable one has probably earned you a lot, but it can also trap you in a role where your value feels tied to carrying more than other people can. Real strength includes knowing that your worth is not limited to what you can hold together."] },
  restorative: { n: "Restorative", d: "executing", desc: "You are adept at dealing with problems. You are good at figuring out what is wrong and resolving it.",
    availableTendency: "act with confidence, trust your judgment, and move decisively when the map is incomplete",
    awarenessCue: "the room has enough information and is now just looking for more reassurance",
    coreContext: "ambiguity is high and someone still has to choose a direction",
    coreResult: "create steadiness and movement without collapsing into doubt",
    defaultTendency: "shared validation, external input, or collaborative calibration",
    introAction: "trust",
    introObject: "your own judgment in ambiguity",
    introPayoff: "so decisions can move forward without needing endless external validation",
    investmentMove: "trust your inner compass, but keep inviting enough reality-testing to stay accurate",
    lowDefault: "trust your own judgment quickly without much outside confirmation",
    lowMiss: "when a situation needs more inner certainty, steadiness, or self-trust",
    lowRisk: "overreliance on group validation, consensus, or reassurance",
    naturalTendency: "rely on your internal compass and move with unusual steadiness in uncertainty",
    overuseCost1: "sounding closed or harder to influence than you intend",
    overuseCost2: "weakening alignment or buy-in",
    overusePattern1: "you may overtrust your own read and underweight external input",
    overusePattern2: "you may move too independently in situations that would benefit from more shared calibration",
    overuseTrigger1: "when inner certainty hardens faster than outside reality can keep up",
    overuseTrigger2: "when needing no validation becomes part of your identity",
    partnershipCue: "leaning on people who naturally bring steadiness and decision confidence in ambiguity",
    supportBenefit: "act with more confidence without pretending certainty where none exists",
    supportCondition: "ambiguity is unavoidable and no amount of extra input will fully remove it",
    supportPartner: "people who naturally move with steadiness and help anchor decisions under uncertainty",
    supportStructure: "clear decision rights, criteria, or a defined point where input ends and choice begins",
    themePriority: "internal certainty and self-trusting judgment",
    underuseAdvantage: "internal confidence and steadiness under ambiguity",
    underuseCost: "slowing decisions that needed more conviction",
    underuseMiss: "teams can overdepend on outside validation or shared reassurance before moving",
    atWork: "You are the fixer. When a project is off the rails, a process is broken, or a client relationship is strained, you dig in. You diagnose problems quickly and you do not rest until the issue is resolved.",
    atBest: "You turn crises into comebacks. You see opportunity where others see failure. Your ability to diagnose and resolve makes you the person everyone wants in the room when things go wrong.",
    leanIn: "Volunteer for the turnaround assignments. The struggling account, the broken process, the campaign that needs saving. That is where your energy comes alive. Also, apply your diagnostic skills proactively, not just in crisis mode. Audit systems and processes before they break.",
    thrive: "You thrive when something is broken, unclear, off-track, or underperforming and there is a real chance to diagnose it and make it better. Problems energize you, and you do your best work when your attention can go toward fixing what is not working instead of pretending everything is fine.",
    blindSpots: ["Your instinct to find and solve problems can make you more engaged by what is wrong than by what is stable, successful, or already functioning well. Others may experience you as resourceful and invaluable in a crisis, or as negative, hard to satisfy, and magnetized toward flaws even when the bigger picture is actually healthy.", "You may also tie your usefulness too closely to being needed in difficult situations. If you are not careful, you can become the person who unconsciously waits for the next mess, inserts yourself into issues that are not yours to solve, or feels strangely underused when there is nothing obvious to fix."],
    actionItems: ["**Aim your diagnostic energy where it matters most.** You are exceptionally good at identifying what is off and getting underneath the problem. The more intentionally you focus that gift on issues with real impact, the more valuable your problem-solving becomes.", "**Do not let flaw-finding become your only lens.** You often see the break before anyone else does, which is useful, but not everything needs repair. Strengthen your ability to notice what is already working so your judgment feels balanced instead of perpetually corrective.", "**Solve with people, not just for them.** It is tempting to jump in, diagnose fast, and take over when something is broken. But some of your highest-leverage work comes from helping others understand the issue and build their own capacity to fix it next time.", "**Notice when crisis is becoming your comfort zone.** You are excellent under pressure, but that does not mean pressure should become your preferred climate. Build some identity around improvement, prevention, and steady-state health too, not just around heroic recovery.", "**Make space in life for things that do not need fixing.** Your mind is built to troubleshoot, and that can make rest oddly unsatisfying if nothing is asking for repair. Give yourself experiences, relationships, and routines where your value is not tied to solving a problem before you are allowed to enjoy them."] },
  activator: { n: "Activator", d: "influencing", desc: "You make things happen by turning thoughts into action. You want to do things now, not just talk about them.",
    availableTendency: "start things, create urgency, and get a team unstuck",
    awarenessCue: "a team is circling the same conversation without taking a first step",
    coreContext: "a first step is needed and overdiscussion is becoming a drag",
    coreResult: "create meaningful momentum",
    defaultTendency: "reflection, structure, proof, or alignment",
    introAction: "turn",
    introObject: "ideas into motion",
    introPayoff: "so discussion becomes action before momentum dies",
    investmentMove: "pair your bias for action with a simple checkpoint so speed stays useful",
    lowDefault: "move before every detail is settled",
    lowMiss: "when a group needs more urgency, initiation, or first-step energy",
    lowRisk: "overplanning, delay, or waiting for perfect readiness",
    naturalTendency: "create momentum, initiate quickly, and move things out of talk and into action",
    overuseCost1: "steamrolling nuance, preparation, or alignment",
    overuseCost2: "energizing people into starts you do not stay around to carry",
    overusePattern1: "you may move faster than the room is ready for",
    overusePattern2: "you may confuse movement with progress",
    overuseTrigger1: "when waiting starts to feel intolerable",
    overuseTrigger2: "when starting becomes more exciting than sustaining",
    partnershipCue: "working with people who naturally create urgency and initiate movement",
    supportBenefit: "start faster without sacrificing your preference for thoughtfulness",
    supportCondition: "something needs to start before it becomes overdiscussed or stuck",
    supportPartner: "people who naturally create momentum and are comfortable moving early",
    supportStructure: "clear deadlines, first-step plans, or external urgency",
    themePriority: "fast initiation and action-first momentum",
    underuseAdvantage: "decisive movement and first-step energy",
    underuseCost: "losing momentum that only needed a push to begin",
    underuseMiss: "teams can linger too long in discussion",
    atWork: "You turn talk into action. While others are still debating the plan, you have already taken the first step. You create momentum and you believe that clarity comes from doing, not from planning.",
    atBest: "Projects start because of you. Teams move because of you. Your bias toward action prevents the firm from getting stuck in analysis paralysis and your energy is genuinely contagious.",
    leanIn: "Be the person who says 'I will take the first step on this' at the end of every meeting. Your willingness to initiate is rare and extremely valuable. Pair yourself intentionally with people who are strong finishers so that what you start gets completed at the same quality you initiated it with.",
    thrive: "You thrive when you can turn ideas into motion before they get buried under discussion. Momentum energizes you, and you do your best work when you have permission to start, test, and move things forward quickly.",
    blindSpots: ["Your bias toward action can make you impatient with deliberation, nuance, or process. What feels like healthy urgency to you can feel abrupt or steamrolling to people who need more time to think, align, or prepare.", "You may also confuse movement with progress. Starting is your gift, but not every quick start leads somewhere useful, and you can lose interest once the novelty wears off. When that happens, it is not just unfinished work, it can feel to other people like you got them energized and then left them holding the bag."],
    actionItems: ["**Take the first step on purpose.** Volunteer to initiate when a team is stuck, but define what the first step is actually meant to accomplish. Your strength is not just speed, it is your ability to convert ambiguity into momentum that other people can build on.", "**Build a handoff before you launch.** Before you start something, name who will help shape it, refine it, or carry it through. You do not need to become a finisher to be effective, but you do need a system that keeps your starts from becoming someone else's cleanup.", "**Pause long enough to bring people with you.** A short check-in before you move can save you from unnecessary resistance later. You will still move faster than most people, but you will do it with more buy-in and less friction.", "**Stay accountable for the energy you create.** If you rally people around an idea, do not disappear the second the excitement fades. Even when you are handing something off, close the loop clearly so people feel led, not abandoned.", "**Create momentum outside of work, too.** When you feel stuck personally, give yourself a tiny concrete starting point instead of waiting to feel ready. Your life gets better when you trust that movement creates clarity, but only when that movement is aimed at something that matters."] },
  command: { n: "Command", d: "influencing", desc: "You have presence. You can take control of a situation and make decisions. You are not afraid of confrontation.",
    availableTendency: "bring firmness, direction, and clearer authority when a moment needs backbone",
    awarenessCue: "everyone is circling the truth, but no one is naming it clearly",
    coreContext: "a hard call needs to be made and diplomacy alone is not enough",
    coreResult: "create clarity, direction, and decisiveness",
    defaultTendency: "steadiness, collaboration, or reasoned influence",
    introAction: "bring",
    introObject: "direction and candor into a hard moment",
    introPayoff: "so uncertainty gives way to clarity and movement",
    investmentMove: "make sure your candor creates clarity without closing the room too early",
    lowDefault: "take control or state the hard call early",
    lowMiss: "when a room needs more directness, candor, or authority",
    lowRisk: "overreliance on diplomacy, reasoning, or collaboration when firmness is needed",
    naturalTendency: "step into difficult moments, take a stand, and say what others are hesitant to name",
    overuseCost1: "making honesty feel like intimidation or premature conclusion",
    overuseCost2: "making everything depend on your force instead of stronger structure",
    overusePattern1: "you may shut people down or force the room faster than it can process",
    overusePattern2: "you may overfunction rather than share power or build authority in others",
    overuseTrigger1: "when directness arrives before people have fully entered the conversation",
    overuseTrigger2: "when you start believing things will weaken unless you take control",
    partnershipCue: "relying on people who naturally step in with directness and decisive authority",
    supportBenefit: "say the hard thing without needing to become the constant enforcer",
    supportCondition: "the moment genuinely requires a clear line, firmer stance, or harder call",
    supportPartner: "people who naturally bring backbone, authority, and clear direction",
    supportStructure: "role clarity, decision rights, or explicit permission to be direct",
    themePriority: "forceful direction and direct authority",
    underuseAdvantage: "firmness, backbone, and plainspoken direction",
    underuseCost: "letting drift continue when a stronger line would help",
    underuseMiss: "groups can stay overly vague, deferential, or indecisive",
    atWork: "You take charge. In a crisis, in a stakeholder meeting, in a moment of indecision, you step forward and say what needs to happen. You are comfortable with confrontation and you do not shy away from difficulty.",
    atBest: "You bring clarity and direction when everyone else is frozen. You name the thing nobody else will say. You make decisions when decisions need to be made, and people feel safer because someone is driving.",
    leanIn: "Step into leadership moments explicitly. When a situation needs someone to take charge, do not wait to be asked. Also, use your presence to create space for others to speak up, because your ability to hold a room is just as powerful when you use it to elevate other voices as when you use it to direct.",
    thrive: "You thrive when there is a hard call to make, a room that needs direction, or a truth that nobody else wants to say out loud. Pressure often clarifies you, and you do your best work when strength, decisiveness, and candor are actually needed.",
    blindSpots: ["Your directness can create clarity, but it can also shut people down before they have fully entered the conversation. What feels to you like honesty or leadership can feel to others like force, intimidation, or a conclusion that arrived before their input had a real chance to matter.", "You may also start to believe that if you do not take control, things will drift or weaken. That can make you over-function in situations where your real growth would come from creating structure, sharing power, or letting someone else build authority instead of stepping in first."],
    actionItems: ["**Use your voice to create clarity, not fear.** You do not need to soften into vagueness to be effective, but you do need to pay attention to your impact. People are more likely to follow strong direction when they feel steadied by it rather than overpowered.", "**Decide when the room actually needs force.** Not every slow conversation is a leadership failure, and not every disagreement needs a winner. Your authority becomes more credible when people can tell you are choosing firmness deliberately, not defaulting to it automatically.", "**Create space before you close it.** Ask for input before you make the call, especially when you already know what you think. You will still move decisively, but you will gather better information and build more trust on the way there.", "**Develop other people's confidence, not just your own control.** One of the highest uses of your strength is helping less forceful people find their footing. When you use your presence to back someone else's voice, your leadership gets bigger, not smaller.", "**Notice where strength becomes armor.** Being capable and unafraid has served you, but it can also become a way to avoid uncertainty, vulnerability, or dependence. Real power includes knowing when you do not need to dominate the moment to be safe in it."] },
  communication: { n: "Communication", d: "influencing", desc: "You find it easy to put thoughts into words. You are a good conversationalist and presenter.",
    availableTendency: "explain, frame, translate, and help a message land with other people",
    awarenessCue: "the room understands the issue in theory but not yet in language people can carry forward",
    coreContext: "complexity needs framing and the room needs clearer articulation",
    coreResult: "make the message legible, persuasive, and memorable",
    defaultTendency: "thinking, structure, judgment, or action",
    introAction: "put",
    introObject: "ideas into language that lands",
    introPayoff: "so people grasp, remember, and act on the point",
    investmentMove: "keep making your language vivid, but tether it tightly to substance and timing",
    lowDefault: "lead with verbal expression or message-shaping",
    lowMiss: "when a situation needs clearer framing, better storytelling, or stronger articulation",
    lowRisk: "relying on thought, action, or structure without helping others fully understand the point",
    naturalTendency: "shape language, tell the story, and make ideas clearer, stronger, and more memorable",
    overuseCost1: "filling the space before quieter thinking has had a chance to surface",
    overuseCost2: "weakening credibility when the message is slicker than the logic behind it",
    overusePattern1: "you may mistake airtime for value or polish for depth",
    overusePattern2: "you may focus more on how something sounds than whether it is fully sound",
    overuseTrigger1: "when verbal fluency arrives faster than the thinking underneath it",
    overuseTrigger2: "when style starts to outrun substance",
    partnershipCue: "leaning on people who naturally frame, explain, and sharpen the message",
    supportBenefit: "make your ideas easier to grasp without having to perform them constantly",
    supportCondition: "the idea is good, but it is not landing clearly enough",
    supportPartner: "people who naturally translate complexity into language that lands",
    supportStructure: "prep time, talking points, or a clear message frame",
    themePriority: "language-first clarity and expression",
    underuseAdvantage: "clearer framing and stronger articulation",
    underuseCost: "reducing clarity and buy-in",
    underuseMiss: "useful ideas may stay vague, underexplained, or less persuasive than they could be",
    atWork: "You are the storyteller. You make complex ideas simple, dry material engaging, and client presentations memorable. You think in narratives and you instinctively know how to frame a message for any audience.",
    atBest: "You are the voice of the team. You bring ideas to life in a way that moves people. Your ability to frame, narrate, and present makes the firm's work shine and makes other people's good work visible.",
    leanIn: "Volunteer for the high-visibility communications moments. The client presentation, the press strategy, the internal all-hands. Also, offer your framing skills to colleagues who have strong ideas but struggle to articulate them. Your ability to make other people's work compelling is one of the most generous applications of this strength.",
    thrive: "You thrive when you can put ideas into words that land, stick, and move people. Expression energizes you, and you do your best work when you can turn complexity into something vivid, clear, and memorable.",
    blindSpots: ["Because you are comfortable verbalizing ideas, you can sometimes mistake fluency for depth or airtime for value. Others may experience you as engaging and compelling, or as someone who filled the space before quieter, less polished thinking had a chance to surface.", "You may also over-focus on how something is said at the expense of whether it is structurally sound, fully thought through, or matched to the room. A strong message can carry a lot, but if style starts outrunning substance, your credibility eventually takes the hit."],
    actionItems: ["**Use your voice to clarify, not just to contribute.** Before you speak, ask what the room actually needs from you, energy, framing, translation, or direction. Your communication gets more powerful when it is intentional instead of merely fluent.", "**Leave space for less polished thinkers.** Some of the best ideas arrive slowly, awkwardly, or without your level of verbal confidence. If you are always first, fastest, or most compelling, you may accidentally train the room to defer to style instead of insight.", "**Match the message to the audience.** You naturally know how to make things engaging, but the goal is not always to impress. The more precisely you tailor your tone, examples, and level of detail to the listener, the more trust your words will carry.", "**Pressure-test the substance behind the story.** A message that sounds good is not automatically a message that is strong. Build the habit of asking whether the argument underneath your framing is as solid as the framing itself.", "**Be quiet on purpose sometimes.** Not because your voice is a problem, but because silence can sharpen your judgment. Listening a beat longer can make what you say next more grounded, more strategic, and far more memorable."] },
  competition: { n: "Competition", d: "influencing", desc: "You measure your progress against others. You strive to win first place and revel in contests.",
    availableTendency: "raise standards, increase intensity, and respond to visible benchmarks",
    awarenessCue: "the group is drifting because the bar is too fuzzy or too low",
    coreContext: "the stakes are visible and there is a real standard to beat",
    coreResult: "sharpen effort and elevate performance",
    defaultTendency: "meaning, quality, relationships, learning, or progress",
    introAction: "raise",
    introObject: "the bar against a visible standard",
    introPayoff: "so performance becomes sharper, clearer, and more energized",
    investmentMove: "let standards drive excellence without turning every room into a scoreboard",
    lowDefault: "orient around winning, ranking, or head-to-head comparison",
    lowMiss: "when visible standards or benchmarking would sharpen the work",
    lowRisk: "underusing performance pressure in situations where it would help",
    naturalTendency: "notice the scoreboard, care where you stand, and feel energized by winning, ranking, or measurable comparison",
    overuseCost1: "making collaboration or development feel secondary to immediate performance",
    overuseCost2: "disengaging from worthwhile efforts that do not come with visible comparison",
    overusePattern1: "you may dismiss work that is meaningful but not easily ranked or measured",
    overusePattern2: "you may lose energy or underestimate the value of the work",
    overuseTrigger1: "when the scoreboard becomes the only thing that feels worth honoring",
    overuseTrigger2: "when there is no obvious way to know who is ahead",
    partnershipCue: "partnering with people who naturally benchmark performance and raise intensity",
    supportBenefit: "bring more edge into the work without making everything a contest",
    supportCondition: "the work would benefit from a clearer benchmark, target, or scorecard",
    supportPartner: "people who naturally raise the bar through performance intensity",
    supportStructure: "concrete metrics, visible standards, or comparative data",
    themePriority: "measurable comparison and winning energy",
    underuseAdvantage: "sharper standards and healthy performance pressure",
    underuseCost: "lowering intensity or leaving performance gains on the table",
    underuseMiss: "teams may settle for good enough without a stronger benchmark",
    atWork: "You are aware of the scoreboard at all times. You know how your numbers compare to your peers, how your team stacks up against other firms, and where you rank. This awareness pushes you to work harder and produce more.",
    atBest: "You raise the bar for everyone. Your drive to be the best is infectious and your intensity elevates team performance. You celebrate wins and you hate losing in a way that keeps the team hungry and ambitious.",
    leanIn: "Channel your competitive energy toward external benchmarks. How does the firm stack up against competitors? How does your account's performance compare to industry standards? When you frame competition as the team versus the world rather than you versus your colleagues, everyone benefits from your intensity.",
    thrive: "You thrive when there is a clear standard to beat, a benchmark to chase, or a visible way to know whether you are winning. Comparison energizes you, and you do your best work when effort is tied to excellence, not just participation.",
    blindSpots: ["Your drive to win can raise performance, but it can also make you dismissive of anything that does not feel measurable, competitive, or first-rate. Others may experience you as motivating and sharp, or as intense, status-conscious, and overly focused on the scoreboard when collaboration or long-term development matters more than immediate rank.", "You may also struggle to stay engaged when there is no obvious way to know who is ahead. If the goal feels fuzzy or the outcome is not clearly comparable, your energy can drop fast, and you may underestimate valuable work simply because it does not come with a visible finish line."],
    actionItems: ["**Aim your edge outward, not inward.** Your competitive drive is most useful when it helps the team outperform the market, the competition, or the prior baseline, not when it turns every room into an internal ranking exercise. You are at your best when your intensity sharpens standards without making colleagues feel like collateral damage.", "**Define the right scoreboard.** Not every meaningful outcome is obvious at first glance. If you need something to measure, build a metric that reflects what actually matters rather than defaulting to the easiest or loudest signal of success.", "**Use winning to build, not just to prove.** Victory feels good to you, but the real leverage is in what higher standards make possible for the team. When you connect performance to growth, reputation, or impact, your ambition becomes easier for other people to trust.", "**Stay in the game when you are not ahead yet.** Your energy can spike when you are close to winning and dip when the path feels uncertain. Train yourself to stay engaged through the middle stretch, because that is often where real advantage is built.", "**Notice where comparison is stealing your peace.** Some comparison sharpens you, and some just keeps you restless. If you never let yourself enjoy what is already good because someone, somewhere is doing more, winning will start to feel strangely empty."] },
  maximizer: { n: "Maximizer", d: "influencing", desc: "You focus on strengths to stimulate excellence. You seek to transform something strong into something superb.",
    availableTendency: "sharpen strengths, raise quality, and improve what is already promising",
    awarenessCue: "the work is competent, but no one is asking how to make it exceptional",
    coreContext: "there is strong raw material worth investing in rather than fixing everything equally",
    coreResult: "move the work from solid to exceptional",
    defaultTendency: "usefulness, balance, or improvement across the whole field",
    introAction: "refine",
    introObject: "what is already strong",
    introPayoff: "so good becomes excellent instead of merely adequate",
    investmentMove: "keep pushing toward excellence, but stay honest about when good enough is actually enough",
    lowDefault: "focus first on refining strengths toward excellence",
    lowMiss: "when the work would benefit more from sharpening what is best than from fixing what is weakest",
    lowRisk: "overemphasis on sufficiency, practicality, or broad coverage",
    naturalTendency: "spot what has potential for excellence and push it toward a higher ceiling",
    overuseCost1: "making practicality or sufficiency harder to accept than it needs to be",
    overuseCost2: "leaving important liabilities unattended",
    overusePattern1: "you may dismiss work that is simply good enough for the moment",
    overusePattern2: "you may underinvest in weak areas that still matter",
    overuseTrigger1: "when excellence becomes the only standard that feels emotionally satisfying",
    overuseTrigger2: "when your attention stays only on what is already strongest",
    partnershipCue: "relying on people who naturally spot strength and know how to elevate it further",
    supportBenefit: "raise quality without needing excellence to become the only thing you can tolerate",
    supportCondition: "there is already a strong asset that deserves deeper investment",
    supportPartner: "people who naturally notice what is best and know how to elevate it",
    supportStructure: "quality criteria, strength-based review, or room to iterate toward excellence",
    themePriority: "excellence through refinement of strengths",
    underuseAdvantage: "strength-sharpening and quality elevation",
    underuseCost: "lowering the overall ceiling of the work",
    underuseMiss: "teams may settle for adequacy when there is clear room for excellence",
    atWork: "You take good work and make it great. You push for one more round of edits. You refine the strategy until it is sharp. You see potential in people and deliverables and you cannot rest until that potential is realized.",
    atBest: "You produce exceptional quality. You elevate everything you touch. You help people see what they are already good at and push them to develop those strengths further. You set a standard of excellence that raises the whole team.",
    leanIn: "Apply your eye for excellence to the firm's most visible work. Position yourself as the quality bar. Also, turn your Maximizer lens on people, not just deliverables. When you notice what a colleague does well and tell them, you accelerate their growth in a way that most feedback never achieves.",
    thrive: "You thrive when there is strong raw material to refine, real talent to develop, or good work that could become exceptional with the right pressure. Excellence energizes you, and you do your best work when you can raise the ceiling instead of settling for merely adequate results.",
    blindSpots: ["Your eye for excellence can make you impatient with mediocrity, inefficiency, or work that feels good enough to everyone else. What feels to you like high standards and discernment can come across as hard to please, overly critical, or perpetually dissatisfied when people feel like their effort only earns another round of refinement.", "You may also overfocus on what is already strong and undervalue work, people, or systems that still need basic development. In trying to turn the best into exceptional, you can miss opportunities to build broader capacity or create an environment where only obvious talent gets your full investment."],
    actionItems: ["**Use your standards to elevate, not exhaust.** Your instinct to improve strong work is one of your biggest assets, especially in visible or high-stakes settings. The more clearly you can explain what better looks like and why it matters, the more your standards feel developmental instead of demoralizing.", "**Choose carefully where perfection is worth it.** Not every project needs the same level of refinement, and not every draft deserves elite-treatment energy. Save your strongest push for the work that truly benefits from precision, polish, and extra lift.", "**Make room to recognize progress before pointing to the gap.** You often see what could still be stronger almost instantly, which is useful but not always easy to receive. When people feel that you can see what is already working, they trust your push toward excellence a lot more.", "**Do not let selectivity become neglect.** It is smart to invest heavily where the upside is real, but pay attention to what or who you are consistently overlooking. Sometimes the highest-leverage move is not making the strongest thing better, it is bringing a weaker area up to functional strength.", "**Let excellence support your life without becoming the only lens.** Your standards can make ordinary enjoyment harder than it needs to be if everything gets evaluated against its highest possible form. Give yourself places where good, warm, and real are allowed to be enough."] },
  self_assurance: { n: "Self-Assurance", d: "influencing", desc: "You feel confident in your ability to take risks and manage your own life. You have an inner compass.",
    atWork: "You trust yourself. You make decisions confidently, take risks without excessive deliberation, and navigate ambiguity with a steadiness that others rely on. You do not need external validation to feel certain.",
    atBest: "You are an anchor. In uncertain moments, your confidence is calming. You make calls when others hesitate. You take on challenges that would intimidate others because you trust your ability to handle whatever comes.",
    leanIn: "Step into the situations that others are afraid of. The ambiguous client relationship, the high-stakes negotiation, the strategy call with incomplete information. Your confidence is most valuable in the moments where everyone else feels uncertain. Also, share your reasoning out loud so others can learn from the internal compass that guides you.",
    thrive: "You thrive when you can trust your own judgment, move decisively in ambiguity, and act without needing constant external reassurance. You do your best work when confidence is useful, stakes are real, and your internal compass has room to do what it naturally does.",
    blindSpots: ["Your self-trust can make you less likely to seek input, test assumptions, or show uncertainty before you move. What feels to you like steadiness and independence can come across as dismissive, overconfident, or oddly hard to influence when other people are trying to contribute something that might actually strengthen the decision.", "You may also underestimate how differently your certainty lands on people who do not feel things as firmly or internally as you do. If you rely too heavily on instinct without making your reasoning visible, others may experience you as powerful but opaque, and confidence without explanation can start to look a lot like arrogance."],
    actionItems: ["**Trust yourself and still pressure-test the call.** Your confidence is a real asset, especially in uncertain situations where hesitation would cost the team momentum. The more you pair conviction with a quick check for blind spots, the more credible and durable your judgment becomes.", "**Show the logic behind the instinct.** You often know what you think before other people have fully oriented to the problem. Bringing others into your reasoning does not weaken your authority, it makes your confidence easier to trust and easier for others to learn from.", "**Use certainty as a stabilizer, not a silencer.** People often feel steadier around someone who can move without panicking. Just make sure your confidence leaves room for contribution instead of ending the conversation before the best information has surfaced.", "**Notice where independence is becoming isolation.** Being internally directed has likely served you well, but it can also become a reason to carry too much alone or underuse the wisdom around you. Strength includes knowing when input will sharpen the outcome, not just when it is required.", "**Build a life where you do not always have to be the strongest presence in the room.** Confidence is one of your gifts, but it should not become the only role you know how to play. Let yourself have spaces where you can be uncertain, learning, or supported without feeling less powerful because of it."],
    introAction: "trust", introObject: "your own judgment in ambiguity", introPayoff: "so decisions can move forward without needing endless external validation",
    naturalTendency: "rely on your internal compass and move with unusual steadiness in uncertainty",
    availableTendency: "act with confidence, trust your judgment, and move decisively when the map is incomplete",
    coreContext: "ambiguity is high and someone still has to choose a direction",
    coreResult: "create steadiness and movement without collapsing into doubt",
    overuseTrigger1: "when inner certainty hardens faster than outside reality can keep up", overusePattern1: "you may overtrust your own read and underweight external input", overuseCost1: "sounding closed or harder to influence than you intend",
    overuseTrigger2: "when needing no validation becomes part of your identity", overusePattern2: "you may move too independently in situations that would benefit from more shared calibration", overuseCost2: "weakening alignment or buy-in",
    underuseAdvantage: "internal confidence and steadiness under ambiguity", underuseMiss: "teams can overdepend on outside validation or shared reassurance before moving", underuseCost: "slowing decisions that needed more conviction",
    lowDefault: "trust your own judgment quickly without much outside confirmation", lowMiss: "when a situation needs more inner certainty, steadiness, or self-trust", lowRisk: "overreliance on group validation, consensus, or reassurance",
    defaultTendency: "shared validation, external input, or collaborative calibration", themePriority: "internal certainty and self-trusting judgment",
    supportCondition: "ambiguity is unavoidable and no amount of extra input will fully remove it", supportStructure: "clear decision rights, criteria, or a defined point where input ends and choice begins", supportPartner: "people who naturally move with steadiness and help anchor decisions under uncertainty", supportBenefit: "act with more confidence without pretending certainty where none exists",
    investmentMove: "trust your inner compass, but keep inviting enough reality-testing to stay accurate", awarenessCue: "the room has enough information and is now just looking for more reassurance", partnershipCue: "leaning on people who naturally bring steadiness and decision confidence in ambiguity" },
  significance: { n: "Significance", d: "influencing", desc: "You want to make a big impact. You prioritize projects based on how much influence they will have.",
    availableTendency: "raise the stakes, resist smallness, and push toward work with visible importance",
    awarenessCue: "the work is competent, but no one is naming why it actually matters",
    coreContext: "the work has enough consequence or potential impact to justify full ambition",
    coreResult: "increase meaningfulness, aspiration, and standards of importance",
    defaultTendency: "substance over visibility, pragmatism, or lower-key contribution",
    introAction: "aim",
    introObject: "your effort at something that matters",
    introPayoff: "so ambition is attached to real impact instead of smallness",
    investmentMove: "keep aiming high, but stay alert to the difference between real impact and mere visibility",
    lowDefault: "naturally orient toward work that feels important, consequential, or high-impact",
    lowMiss: "when the work needs more aspiration, higher stakes, or a clearer sense of why it matters",
    lowRisk: "preferring substance, practicality, or modesty in ways that may undersell impact",
    naturalTendency: "want your work to matter, your effort to count, and your contribution to register",
    overuseCost1: "dismissing important work because it looks too small",
    overuseCost2: "confusing importance with prominence",
    overusePattern1: "you may underweight quieter forms of value",
    overusePattern2: "you may become more attached to impact language than to the substance underneath it",
    overuseTrigger1: "when significance starts to feel synonymous with visibility or scale",
    overuseTrigger2: "when the need for the work to matter becomes ego-sensitive",
    partnershipCue: "relying on people who naturally raise the stakes and push work toward greater impact",
    supportBenefit: "increase aspiration without needing significance to be the emotional fuel behind everything",
    supportCondition: "the work is being treated as too small when its consequences are larger",
    supportPartner: "people who naturally raise the stakes and refuse to let important work be treated like filler",
    supportStructure: "impact framing, clearer stakes, or a stronger articulation of why the work matters",
    themePriority: "importance, impact, and meaningful ambition",
    underuseAdvantage: "raised stakes and meaningful ambition",
    underuseCost: "leaving significance and aspiration on the table",
    underuseMiss: "the room may settle for work that is useful but underpowered in impact",
    atWork: "You want to make a visible impact. You are drawn to high-profile projects, leadership roles, and work that will be remembered. You are independent and you prioritize based on how much influence the work will have.",
    atBest: "You do transformative work. You aim higher than others and you pull the team toward ambitious goals. Your desire for impact drives you to produce work that actually moves the needle, not just fills a slot.",
    leanIn: "Seek out the projects that will define the firm's reputation. Pitch ideas that are bigger than what the client asked for. Your ambition is an asset when it is channeled toward outcomes that benefit the whole team. Also, document your impact. Build a track record that speaks for itself, because that is the legacy you are wired to create.",
    thrive: "You thrive when the work matters, the stakes feel real, and your effort has the potential to make a visible difference. Impact energizes you, and you do your best work when you can aim at something meaningful enough to justify your ambition.",
    blindSpots: ["Your desire to matter can make ordinary work feel deadening, low-visibility roles feel undervalued, and recognition feel more important than you want to admit. What feels to you like healthy ambition and high standards can come across as image-conscious, status-driven, or dismissive of contributions that are less visible but still essential.", "You may also attach too much of your identity to being impressive, influential, or seen as exceptional. If significance becomes the lens through which you evaluate every role, project, or relationship, you can end up chasing external proof at the expense of deeper fit, sustainability, or actual fulfillment."],
    actionItems: ["**Aim your ambition at work that deserves it.** Wanting impact is not shallow, it is part of how you are wired. The more clearly you connect your drive to outcomes that genuinely matter, the more your ambition reads as leadership instead of ego.", "**Respect the infrastructure behind visible success.** Not all important work is obvious from the outside, and not every meaningful contribution comes with applause. Training yourself to value what is essential, not just what is seen, will make your judgment more balanced and your leadership stronger.", "**Define impact more carefully than praise.** Recognition feels good, but it is not the same thing as significance. Ask whether the thing you are chasing is actually influence, legacy, usefulness, or just evidence that someone noticed you.", "**Let the room be bigger than your reflection in it.** You bring intensity and aspiration, which can be catalytic in the right setting. Just make sure your presence expands the mission, the team, or the work itself rather than quietly turning every important moment into a referendum on your own standing.", "**Build a life that feels meaningful even when nobody is clapping.** Some of your healthiest growth will come from choosing what is deeply right over what is obviously impressive. You do not become less significant when your worth is no longer dependent on being constantly witnessed."] },
  woo: { n: "Woo", d: "influencing", desc: "You love the challenge of meeting new people and winning them over. You derive satisfaction from breaking the ice.",
    availableTendency: "warm up the room, open doors, and help relationships get started",
    awarenessCue: "the opportunity depends on warming up a new room, not just doing good work once you are inside it",
    coreContext: "the moment requires new connection, ease with strangers, or social opening moves",
    coreResult: "make unfamiliar spaces feel more engaged and more connected",
    defaultTendency: "depth, familiarity, or quieter social pacing",
    introAction: "create",
    introObject: "connection quickly with new people",
    introPayoff: "so doors open faster and unfamiliar spaces warm up",
    investmentMove: "keep opening doors, but decide more intentionally which connections deserve deeper follow-through",
    lowDefault: "lead with charm, social opening, or fast rapport-building",
    lowMiss: "when the situation needs quicker connection, more warmth with strangers, or easier door-opening",
    lowRisk: "preferring depth, familiarity, or caution in ways that slow access to new relationships",
    naturalTendency: "build rapport fast, make new connections, and generate social momentum",
    overuseCost1: "creating fast rapport that is not always matched by durable trust",
    overuseCost2: "missing people who need more time before they engage",
    overusePattern1: "you may keep the energy broad and social without always building depth",
    overusePattern2: "you may undervalue quieter, slower, or less outwardly magnetic forms of connection",
    overuseTrigger1: "when the spark of new connection becomes more energizing than deeper follow-through",
    overuseTrigger2: "when social ease becomes the main way you measure whether a room is working",
    partnershipCue: "working with people who naturally create quick rapport and make new spaces easier to enter **10. Closing page** -------------------- ### **Page heading** **How to Use This Report** ### **Body copy** This report is meant to help you understand the full shape of your strengths profile, not to turn every lower-ranked theme into a development project. Your top themes are where you are most likely to find the greatest return from deeper reflection, stronger application, and more intentional development. The rest of your profile still matters, but not every theme needs equal attention. Use this report to understand where you naturally lead, where you have supporting range, and where you may be more likely to rely on context, structure, or partnership. Use your Top 5 report for the deeper coaching and application work. ### **Design direction** Keep this short, restrained, and clean. This should feel like a smart closing note, not a motivational speech. **Additional implementation guardrails** ======================================== -   Keep the strengths philosophy explicit, but concise. It should > ground the report, not dominate it. -   Show all 34 themes in exact rank order, with rank numbers visible. -   Do not expand the layout just to fill pages. -   Keep pacing tight and let density be driven by usefulness, not by > the desire to make the report feel longer. -   Where an existing page or component is already strong and aligned > with this brief, preserve it and refine around it rather than > redesigning it unnecessarily. **Readability and layout guardrails** ------------------------------------- Because this is a fixed PDF, readability should take priority over density. That means: -   do not shrink text excessively to fit more content on a page -   prioritize comfortable reading size over squeezing in additional > copy -   allow pages to expand when needed rather than compressing the layout > too aggressively -   use spacing, hierarchy, and section breaks to create clarity -   keep line lengths readable -   avoid crowded pages with too many text blocks competing for > attention This report does not need to behave like a responsive screen. It is a downloadable PDF, so it should be designed for clear, comfortable reading as a document. ### **Specific guidance** -   body text should remain comfortably readable in a PDF without > zooming -   headings and subheadings should create clear visual hierarchy -   theme entries should have enough spacing around them to avoid > feeling cramped -   charts or visuals should support readability, not reduce the space > available for the text to the point that the text becomes too > small -   if a page feels crowded, reduce content density or continue onto the > next page instead of shrinking everything to fit ### **Priority order** If there is a tension between: 1.  fitting more onto one page 2.  keeping the report easy to read choose readability every time.",
    supportBenefit: "open doors socially without needing outward ease to be your default mode",
    supportCondition: "the room is cold, unfamiliar, or harder to enter than it needs to be",
    supportPartner: "people who naturally create warmth and fast connection with new people",
    supportStructure: "clear introductions, intentional networking, or social on-ramps that lower friction",
    themePriority: "fast rapport and new-connection energy",
    underuseAdvantage: "easier connection and faster social opening",
    underuseCost: "losing access, warmth, or opportunities that begin with social ease",
    underuseMiss: "new relationships can stay colder, slower, or more formal than they need to",
    atWork: "You are the relationship opener. You work a room, win over a new client on the first call, and make people feel comfortable immediately. You thrive on meeting new people and you are energized by the spark of a new connection.",
    atBest: "You open doors that others cannot. You build the firm's network, make introductions, and create warmth wherever you go. People want to work with the firm because they want to work with you.",
    leanIn: "Be the firm's front door. Volunteer for new business pitches, networking events, and client onboarding. Your gift for first impressions is one of the most commercially valuable strengths in consulting. Also, intentionally introduce people in your network to each other, because your ability to connect people creates value that compounds over time.",
    thrive: "You thrive when you can open doors, create connection quickly, and generate energy between people who were strangers a moment ago. New interactions energize you, and you do your best work when charm, warmth, and momentum can help relationships get started.",
    blindSpots: ["Your ease with new people can make depth, follow-through, or staying power less instinctive than the initial connection. What feels to you like friendliness and social agility can come across as superficial, overly polished, or all spark and no substance if people sense that the warmth drops once the novelty of the interaction is gone.", "You may also over-rely on your ability to win people over. Charm can open the door, but it cannot carry weak substance, poor boundaries, or inconsistent delivery forever, and if you lean on likability too hard, you can start to mistake access for trust."],
    actionItems: ["**Use your gift for opening, then build enough depth to keep the connection useful.** First impressions are one of your real superpowers. The more intentionally you follow spark with substance, the more your relationships become assets that last instead of just moments that land well.", "**Know when the room needs warmth and when it needs more than warmth.** You are naturally good at breaking ice, building rapport, and getting people engaged quickly. Just make sure the charm is serving the goal rather than becoming the goal itself.", "**Do not confuse being liked with being trusted.** Likability creates access, which is valuable, but trust is built through consistency, honesty, and what happens after the introduction. Your influence gets much stronger when you treat connection as the start of credibility, not proof of it.", "**Use your social range strategically.** You can move across groups, meet people quickly, and make others feel comfortable faster than most. Be intentional about where that energy goes so you are not scattering yourself across a hundred interactions that never turn into anything meaningful.", "**Protect space for relationships where you do not have to perform.** Being socially magnetic can make it easy to become the upbeat version of yourself all the time. Make sure your life also includes people and places where connection does not depend on your ability to charm the room."] },
  adaptability: { n: "Adaptability", d: "relationship_building", desc: "You prefer to go with the flow. You take things as they come and discover the future one day at a time.",
    availableTendency: "stay flexible, calm, and responsive when plans shift",
    awarenessCue: "the plan has changed, but the room is still acting like it has not",
    coreContext: "the environment is changing and rigid plans no longer fit",
    coreResult: "keep moving with reality instead of fighting it",
    defaultTendency: "stronger direction, clear structure, or intentional control",
    introAction: "respond to",
    introObject: "changing reality in real time",
    introPayoff: "so the work stays useful instead of rigid",
    investmentMove: "keep one or two anchor priorities visible so flexibility does not become drift",
    lowDefault: "improvise or respond fluidly as conditions change",
    lowMiss: "when a situation calls for more flexibility, present-moment response, or calm adjustment",
    lowRisk: "rigidity, frustration, or overattachment to plans",
    naturalTendency: "adjust to what is actually happening and stay present in fast-moving situations",
    overuseCost1: "letting changing demands take over your priorities",
    overuseCost2: "losing traction on what mattered most",
    overusePattern1: "you may become reactive rather than purposeful",
    overusePattern2: "you may underprotect your own agenda or long-range focus",
    overuseTrigger1: "when flexibility starts to replace intention",
    overuseTrigger2: "when you adapt so well to what is in front of you",
    partnershipCue: "pairing with people who stay calm, fluid, and useful when conditions shift",
    supportBenefit: "adapt without feeling like you are losing all structure",
    supportCondition: "the situation is shifting too quickly for rigid planning to hold",
    supportPartner: "people who naturally stay responsive and steady amid change",
    supportStructure: "clear priorities, a flexible plan, or permission to adjust in real time",
    themePriority: "fluid responsiveness and in-the-moment adjustment",
    underuseAdvantage: "real-time adjustment and responsiveness",
    underuseCost: "wasting energy forcing structure onto a moving reality",
    underuseMiss: "teams may hold too tightly to plans that no longer fit",
    atWork: "You do not flinch when the plan changes. You take things as they come, adjust on the fly, and stay calm when everyone else is stressed about the pivot. You live in the present and respond to what is in front of you.",
    atBest: "You are the team's shock absorber. You keep things moving when plans fall apart. You respond to client fire drills without drama. Your flexibility makes you invaluable in an environment where the only constant is change.",
    leanIn: "Position yourself as the go-to person for rapid response and evolving situations. When a new fire drill comes in, raise your hand. Also, help your less adaptable colleagues navigate change by modeling what calm flexibility looks like. Your composure during chaos is a leadership quality even when you do not have the title.",
    thrive: "You thrive when you can respond to what is actually happening, adjust in real time, and work with reality instead of fighting it. You do your best work when flexibility is an asset, change is part of the environment, and staying present matters more than forcing a rigid plan to survive intact.",
    blindSpots: ["Your comfort with change can make you less motivated by long-range structure, fixed routines, or highly detailed planning. What feels to you like flexibility and realism can come across as drift, lack of discipline, or a tendency to wait for the day to reveal itself instead of shaping it more intentionally.", "You may also adapt so well to what is in front of you that you underprotect your own priorities. If you are not careful, responsiveness can turn into reactivity, and you can become the person who handles whatever comes up while slowly losing traction on the things that mattered most to you in the first place."],
    actionItems: ["**Use your flexibility where volatility is real.** You are especially valuable in fast-moving environments where plans change, new information arrives, and other people get rattled by the pivot. The more intentionally you place yourself in work that benefits from real-time responsiveness, the more your strength reads as leadership instead of looseness.", "**Add just enough structure to protect what matters.** You do not need to become rigid to be effective, but you do need a few anchors that keep your day from being entirely claimed by whatever shows up first. Light structure will make your adaptability more powerful, not less natural.", "**Distinguish responsiveness from availability.** Being able to handle the moment does not mean every interruption deserves access to you. The more clearly you decide what actually requires your flexibility, the less likely you are to become endlessly useful to everyone except yourself.", "**Say yes to the pivot without losing the plot.** One of your biggest strengths is staying calm when the plan changes. Pair that with a habit of checking whether the new direction is still serving the larger goal, so your flexibility stays connected to purpose rather than becoming pure improvisation.", "**Let the present be a place you live, not just a place you manage.** You are naturally good at meeting life as it arrives, and that can be a gift well beyond work. Make sure some of that responsiveness is serving joy, spontaneity, and actual presence too, not just other people's changing demands."] },
  connectedness: { n: "Connectedness", d: "relationship_building", desc: "You have faith in the links among all things. You believe there are few coincidences.",
    availableTendency: "widen the frame, add perspective, and connect individual parts to a larger purpose",
    awarenessCue: "the team knows what it is doing, but not why it matters in the larger picture",
    coreContext: "people need more perspective and the moment cannot be understood only tactically",
    coreResult: "help others see meaning, interdependence, and the bigger picture",
    defaultTendency: "logic, action, structure, or pragmatism",
    introAction: "connect",
    introObject: "people, events, and meaning into a larger whole",
    introPayoff: "so the work feels grounded in purpose rather than isolated tasks",
    investmentMove: "keep translating your perspective into sharper, more concrete next steps",
    lowDefault: "lead with larger-purpose framing or deep interconnection",
    lowMiss: "when a situation needs more meaning, perspective, or a sense of how the parts fit together",
    lowRisk: "staying too narrow, too tactical, or too pragmatic",
    naturalTendency: "look for the bigger picture, hidden links, and deeper meaning underneath what is happening",
    overuseCost1: "making people who need immediacy feel like the point is drifting",
    overuseCost2: "underreacting when firmer intervention or clearer boundaries are needed",
    overusePattern1: "you may sound abstract, philosophical, or frustratingly indirect",
    overusePattern2: "you may overtrust that things are unfolding as they should",
    overuseTrigger1: "when the larger web feels more compelling than the immediate decision",
    overuseTrigger2: "when meaning-making softens your response to a hard problem",
    partnershipCue: "leaning on people who naturally connect the work to larger meaning and context",
    supportBenefit: "widen the frame without forcing yourself to live in abstraction",
    supportCondition: "the room is so focused on the immediate task that it is losing sight of the larger picture",
    supportPartner: "people who naturally help others see meaning, purpose, and interdependence",
    supportStructure: "reflection space, mission framing, or explicit connection-making",
    themePriority: "meaning-first perspective and interconnection",
    underuseAdvantage: "perspective, meaning, and interdependence",
    underuseCost: "making the work feel fragmented, transactional, or less connected to purpose",
    underuseMiss: "groups can get stuck in narrow mechanics without a larger frame",
    atWork: "You see the bigger picture. You believe that events, people, and outcomes are all linked. You bring a sense of meaning and purpose to the team by helping others see how their individual work connects to something larger.",
    atBest: "You are a bridge builder. You help people from different backgrounds find common ground. You bring stability during difficult times because you have faith in a larger purpose. You give the team's work meaning beyond the deliverable.",
    leanIn: "Be the person who tells the story of why the work matters. In team meetings, in client conversations, in moments of doubt, connect the dots out loud. Your ability to see the larger web is not just philosophical, it is strategic. It helps teams make better decisions when they can see how the pieces fit together.",
    thrive: "You thrive when you can see the larger meaning, connect people and events into a bigger picture, and work in a way that feels tied to something beyond the immediate task. You do your best work when purpose is visible and the relationships between things matter as much as the individual parts.",
    blindSpots: ["Your ability to see the larger web can make you sound abstract or overly philosophical to people who are focused on immediate facts, deadlines, or tactical choices. What feels to you like perspective and meaning can come across as vague, overly expansive, or frustratingly indirect when others are looking for a sharper point or a faster answer.", "You may also over-trust the idea that things are unfolding as they should, even when a situation actually requires firmer intervention, clearer boundaries, or harder judgment. If you lean too far into meaning-making, you can start to spiritualize what should be confronted more directly."],
    actionItems: ["**Use your perspective to help people locate themselves in the larger picture.** One of your gifts is reminding others that their work, choices, or struggles are part of something broader than the immediate moment. When you connect the dots clearly, you can bring steadiness and meaning to environments that would otherwise feel fragmented or transactional.", "**Make the big picture practical.** Your insight lands best when it helps people understand what to do, not just what it means. The more you can tie your perspective to concrete decisions, relationships, or next steps, the more useful and influential your strength becomes.", "**Do not let meaning replace judgment.** Seeing that everything is connected does not remove the need to make hard distinctions about what is healthy, true, or workable. Keep your perspective, but stay willing to act directly when a problem is not going to resolve itself through understanding alone.", "**Bridge people who do not naturally see each other.** You are often good at recognizing links between individuals, teams, or ideas that others treat as separate. Use that instinct intentionally, because helping people understand their connection can reduce friction and build smarter collaboration.", "**Build a life where your sense of meaning has somewhere honest to live.** You are not built for a purely mechanistic existence, and pretending otherwise will drain you. Give yourself work, relationships, and reflection that let your deeper sense of purpose stay active, not buried under logistics."] },
  developer: { n: "Developer", d: "relationship_building", desc: "You recognize and cultivate the potential in others. You spot signs of improvement and derive satisfaction from progress.",
    availableTendency: "encourage, coach, and support progress rather than just evaluate the present",
    awarenessCue: "someone needs more development than criticism to get better",
    coreContext: "someone has real potential and growth matters more than immediate perfection",
    coreResult: "help people become more capable over time",
    defaultTendency: "outcomes, clarity, standards, or present effectiveness",
    introAction: "invest in",
    introObject: "someone\'s growth and emerging potential",
    introPayoff: "so progress becomes visible over time",
    investmentMove: "keep asking whether the growth is real or whether you are just carrying the hope for it",
    lowDefault: "coach patiently or focus on developmental progress first",
    lowMiss: "when someone would benefit from more encouragement, patience, or growth-oriented support",
    lowRisk: "jumping too quickly to evaluation, standards, or immediate performance",
    naturalTendency: "see potential in people and feel energized by helping them grow",
    overuseCost1: "enabling people who enjoy support more than development",
    overuseCost2: "coaching what is not actually changing",
    overusePattern1: "you may overinvest in people who are not ready or accountable enough to grow",
    overusePattern2: "you may avoid making hard calls about fit, limits, or performance",
    overuseTrigger1: "when hope in someone\'s potential outruns the reality of their effort",
    overuseTrigger2: "when development feels kinder than judgment",
    partnershipCue: "leaning on partners who naturally coach, encourage, and cultivate potential",
    supportBenefit: "help others grow without needing coaching to be your main instinct",
    supportCondition: "the goal is growth, not just immediate output",
    supportPartner: "people who naturally notice and cultivate potential",
    supportStructure: "coaching rhythms, feedback loops, or real development plans",
    themePriority: "long-range development and potential-building",
    underuseAdvantage: "patient development and potential-building",
    underuseCost: "missing growth that could have been cultivated",
    underuseMiss: "people may be judged only on current performance rather than what they could become",
    atWork: "You are the coach. You notice when someone asks a better question in a meeting or writes a sharper memo. You invest time in people who are struggling because you can see their potential. You measure your own success partly by how much the people around you have grown.",
    atBest: "Your team members grow faster under your guidance because you see their potential before they do. You create an environment where people feel safe to learn and stretch. The firm's talent pipeline is stronger because of you.",
    leanIn: "Ask for formal mentoring relationships. Volunteer to onboard new hires. Sit in on work reviews and offer developmental feedback, not just evaluative feedback. Your ability to grow people is one of the highest-leverage things you can do for the firm, because every person you develop becomes a better contributor to every account they touch.",
    thrive: "You thrive when you can spot potential in someone, help it grow, and watch progress become visible over time. You do your best work where growth matters, encouragement is useful, and people are given a real chance to become more capable than they were yesterday.",
    blindSpots: ["Your instinct to see potential can make you overinvest in people who are not ready, willing, or accountable enough to use what you are offering. What feels to you like patience and belief can become enabling if you keep pouring energy into someone who likes support more than growth.", "You may also focus so much on improvement that you avoid making hard calls about fit, performance, or limits. Not everyone needs more coaching, and sometimes the kindest, clearest move is to stop trying to develop what is not actually developing."],
    actionItems: ["**Invest where growth is real, not just possible.** Your eye for potential is powerful, but potential alone is not enough. Look for effort, ownership, and movement, because those are the signals that your investment is likely to pay off.", "**Give feedback that people can use.** Encouragement matters, but it is most effective when it is specific. The more clearly you can name what improved, what matters, and what the next step is, the more your support accelerates real development.", "**Do not confuse support with rescue.** You are naturally generous with your time and belief, but some people will gladly let you carry more than you should. Helping is valuable, but only when it strengthens the other person's capacity instead of replacing it.", "**Take pride in growth without taking ownership of everyone else's outcome.** Your strength is to cultivate, not to control. You can create conditions for people to improve, but their follow-through still belongs to them.", "**Let your eye for growth include you.** You are often so busy noticing what others could become that you underinvest in your own development. Put some of that same patience, structure, and belief toward your own next level."] },
  empathy: { n: "Empathy", d: "relationship_building", desc: "You can sense other people's feelings by imagining yourself in their lives or situations.",
    availableTendency: "read the room, register emotional undercurrents, and respond with sensitivity",
    awarenessCue: "the facts are clear, but the emotional reality in the room is not being addressed",
    coreContext: "emotion is affecting the work whether people name it or not",
    coreResult: "help people feel understood and respond in a way that actually lands",
    defaultTendency: "clarity, logic, or efficiency",
    introAction: "sense",
    introObject: "what other people are feeling beneath the surface",
    introPayoff: "so your response lands in a way that is more human and useful",
    investmentMove: "use your empathy to inform truth-telling, not replace it",
    lowDefault: "lead with emotional attunement or feeling the room first",
    lowMiss: "when a situation needs more sensitivity, emotional awareness, or attunement",
    lowRisk: "missing how something is landing with people until the room is already strained",
    naturalTendency: "pick up emotional reality quickly and respond to it with attunement",
    overuseCost1: "draining your energy and blurring your own perspective",
    overuseCost2: "protecting feelings at the expense of clarity",
    overusePattern1: "you may overidentify, absorb too much, or adjust yourself excessively",
    overusePattern2: "you may soften necessary friction or delay difficult conversations",
    overuseTrigger1: "when other people\'s feelings start to feel like yours to carry",
    overuseTrigger2: "when you can feel the discomfort a hard truth will create",
    partnershipCue: "leaning on people who naturally read emotional undercurrents and help messages land better",
    supportBenefit: "keep your response human without making emotion your main operating system",
    supportCondition: "emotions are shaping the room even if nobody is naming them directly",
    supportPartner: "people who naturally register emotional reality and help name it",
    supportStructure: "pause, reflection, feedback, or explicit check-ins",
    themePriority: "emotional attunement and interpersonal sensitivity",
    underuseAdvantage: "emotional attunement and better read-the-room judgment",
    underuseCost: "making your message land more harshly or less effectively than intended",
    underuseMiss: "tension, defensiveness, or emotional undercurrents can go unrecognized",
    atWork: "You feel the room. You pick up on the anxiety behind a calm question, the frustration behind a polite email, the excitement someone is trying to hide. You instinctively understand emotional dynamics and use that understanding to navigate relationships.",
    atBest: "You are the team's emotional intelligence. You help leaders understand how decisions will land. You defuse tension before it becomes conflict. You make people feel seen and understood, which builds the kind of loyalty that holds teams together.",
    leanIn: "Use your emotional reads strategically. Before a tough client conversation, share what you are sensing with the team lead. In stakeholder meetings, read the room and signal what you are picking up. Also, offer to be a sounding board for colleagues who are navigating a difficult relationship. Your ability to understand how someone is feeling is a form of intelligence that most people do not have.",
    thrive: "You thrive when you can understand what is happening beneath the surface and respond to people in a way that actually lands. You do your best work when emotional reality is treated as useful information, not as a distraction from the real work.",
    blindSpots: ["Your sensitivity to other people's feelings can make you absorb more than is yours to carry. What feels to you like awareness and care can turn into overidentification, emotional fatigue, or a habit of adjusting yourself so much that your own perspective starts to disappear.", "You may also avoid necessary friction because you can feel the discomfort it will create before it even happens. In trying to protect people from hurt, you can soften truths that need to be said, delay hard conversations, or take responsibility for emotions that are not actually yours to manage."],
    actionItems: ["**Use what you sense to inform action.** Your read on people is valuable, but it is most powerful when it helps the team communicate better, lead better, or intervene earlier. Treat emotional insight as data you can translate into smarter decisions, not just something you quietly carry alone.", "**Tell the truth kindly, not endlessly gently.** You do not need to choose between honesty and care. In many cases, the kindest thing you can do is say the hard thing clearly enough that it actually helps rather than cushioning it so much that nothing changes.", "**Separate understanding from responsibility.** Just because you can feel what someone else is feeling does not mean you are responsible for fixing it. Protecting that boundary will make your empathy steadier, cleaner, and much less exhausting.", "**Speak your read before the room hardens.** You often sense tension, discouragement, or misalignment early. Say what you are noticing in practical terms, because your insight is far more useful when it helps the group adapt before the issue calcifies.", "**Build recovery into your life on purpose.** You are taking in more than most people realize, and probably more than you admit. Give yourself regular ways to reset so your care does not quietly turn into depletion."] },
  harmony: { n: "Harmony", d: "relationship_building", desc: "You look for consensus. You seek areas of agreement. Friction wastes time.",
    availableTendency: "steady a room, keep conversations productive, and help groups move toward what is workable",
    awarenessCue: "the conflict is now more draining than useful",
    coreContext: "tension is draining energy without producing meaningful progress",
    coreResult: "move people forward without getting stuck in conflict",
    defaultTendency: "directness, candor, or sharper truth-telling",
    introAction: "find",
    introObject: "common ground and workable overlap",
    introPayoff: "so energy goes toward progress instead of unproductive conflict",
    investmentMove: "let harmony create movement, not premature agreement",
    lowDefault: "smooth conflict, reduce friction, or seek agreement first",
    lowMiss: "when a group\'s tension is wasting time or stalling progress",
    lowRisk: "letting avoidable conflict harden or drag on longer than it should",
    naturalTendency: "reduce unnecessary friction, look for consensus, and keep conflict from becoming the main event",
    overuseCost1: "protecting surface calm at the expense of truth",
    overuseCost2: "preserving peace where clarity, accountability, or principled disagreement would be healthier",
    overusePattern1: "you may smooth over tension too quickly",
    overusePattern2: "you may overvalue agreement in situations that need sharper distinction",
    overuseTrigger1: "when preserving peace starts to matter more than surfacing the real issue",
    overuseTrigger2: "when consensus starts to feel like the goal in itself",
    partnershipCue: "leaning on people who naturally bridge divides and build workable consensus",
    supportBenefit: "keep being candid without letting the room splinter",
    supportCondition: "the room needs more bridge-building and less unnecessary friction",
    supportPartner: "people who naturally build consensus and help others find overlap",
    supportStructure: "norms or facilitation that surface disagreement productively instead of suppressing it",
    themePriority: "common ground and agreement-building",
    underuseAdvantage: "consensus-building and friction reduction",
    underuseCost: "wasting time and energy that could have gone toward movement",
    underuseMiss: "groups can stay needlessly stuck in conflict or circular tension",
    atWork: "You are the consensus builder. You find common ground between people who seem to disagree. You redirect unproductive arguments toward solutions. You believe that alignment moves things forward faster than conflict.",
    atBest: "You make teams functional. You reduce friction, bridge divides, and create environments where people can actually work together. You are the reason coalition partners stay at the table and stakeholder groups do not fall apart.",
    leanIn: "Volunteer for coalition work, multi-stakeholder processes, and any situation where people need to find common ground. That is your superpower. Also, when you find the overlap between two sides, name it explicitly and build the strategy around it. Your ability to see agreement where others see disagreement is incredibly valuable in politics and public affairs.",
    thrive: "You thrive when people can find common ground, unnecessary friction is reduced, and energy goes toward moving things forward instead of getting stuck in conflict. You do your best work when alignment is possible and differences can be worked with rather than turned into constant battles.",
    blindSpots: ["Your instinct to reduce friction can make you too quick to smooth over tension that actually needs to be surfaced. What feels to you like maturity and pragmatism can sometimes look like conflict avoidance, premature agreement, or a tendency to protect the peace at the expense of the truth.", "You may also overvalue consensus in situations where clarity, accountability, or principled disagreement would be healthier. Not every disagreement is wasteful, and if you rush to resolve tension too quickly, you can end up preserving surface calm while the real issue keeps operating underneath it."],
    actionItems: ["**Use common ground as a starting point, not the whole destination.** Your gift is helping people find overlap where others see only opposition. That becomes even more powerful when you use alignment to support honest progress rather than to avoid whatever is still unresolved.", "**Let necessary tension stay in the room long enough to teach something.** Some conflict is unproductive, but some of it is clarifying. The more you can tell the difference, the more credible your peacemaking becomes.", "**Say what is true before you move to what is workable.** Your instinct is often to get people back into motion, which is valuable, but only after reality is named clearly enough to build on. Otherwise you risk creating agreement around language that is too polite to be useful.", "**Do not make yourself responsible for everyone's comfort.** You are especially attuned to discord, which can tempt you to manage the room at your own expense. Let adults have their reactions without assuming you have to absorb or resolve all of them.", "**Choose peace that has integrity.** The healthiest version of your strength is not the absence of disruption, it is the presence of steadiness. In work and in life, protect the kind of peace that can hold honesty, not just the kind that keeps things quiet."] },
  includer: { n: "Includer", d: "relationship_building", desc: "You accept others. You show awareness of those who feel left out and make an effort to include them.",
    availableTendency: "expand participation and help groups become more open and welcoming",
    awarenessCue: "the same voices keep dominating while others stay at the edges",
    coreContext: "people are on the edge of the room, the conversation, or the decision",
    coreResult: "create broader belonging and fuller participation",
    defaultTendency: "selectivity, efficiency, or fit over broad participation",
    introAction: "widen",
    introObject: "the circle of participation",
    introPayoff: "so more people feel seen, welcomed, and able to engage",
    investmentMove: "keep widening the circle, but stay clear on when belonging and fit are different questions",
    lowDefault: "actively widen the circle or notice who is not included",
    lowMiss: "when the room needs more openness, belonging, or participation",
    lowRisk: "tolerating unnecessary exclusion or failing to notice whose voice is missing",
    naturalTendency: "notice who is left out and want to bring them in",
    overuseCost1: "making the group less effective in the name of openness",
    overuseCost2: "weakening selectivity, standards, or focus",
    overusePattern1: "you may widen the circle without enough attention to role clarity or readiness",
    overusePattern2: "you may blur boundaries that were actually useful or necessary",
    overuseTrigger1: "when inclusion starts to matter more than fit or function",
    overuseTrigger2: "when leaving someone out feels emotionally unacceptable",
    partnershipCue: "leaning on people who naturally expand participation and create belonging",
    supportBenefit: "broaden engagement without losing clarity about purpose and fit",
    supportCondition: "the group is becoming too closed, narrow, or internally self-reinforcing",
    supportPartner: "people who naturally notice who is out and bring them in",
    supportStructure: "intentional invitations, access points, or facilitation that makes participation easier",
    themePriority: "inclusion and circle-widening",
    underuseAdvantage: "wider participation and stronger belonging",
    underuseCost: "losing perspective, buy-in, or trust",
    underuseMiss: "people may stay excluded, sidelined, or less engaged than they need to be",
    atWork: "You notice who is missing. In a meeting, you see whose voice has not been heard. In a coalition, you think about which communities are not at the table. You actively work to pull people in.",
    atBest: "You create belonging. New team members feel welcomed because of you. Overlooked perspectives get heard because of you. The firm's work is more representative and more effective because you ensure no one is left out.",
    leanIn: "Make inclusion systematic, not just instinctive. Propose changes to processes that leave people out. Build check-in points where underrepresented voices get space. Also, help the team see inclusion not as a nice-to-have but as a strategic advantage, because broader input genuinely produces better outcomes.",
    thrive: "You thrive when people feel welcomed, overlooked voices are brought in, and the circle gets wider in a meaningful way. You do your best work when belonging is not just a value on paper, but something you can actively help create in how groups function.",
    blindSpots: ["Your instinct to include can make you hesitant to draw hard lines, make exclusive calls, or acknowledge that not every situation should stay fully open. What feels to you like generosity and fairness can sometimes look like vagueness, weak boundaries, or an unwillingness to make the harder call about fit, standards, or access.", "You may also focus so much on who is missing that you underweight what the group actually needs to function well. Inclusion is valuable, but if you treat every setting as if it should work for everyone in exactly the same way, you can lose clarity about purpose, roles, or what successful participation actually requires."],
    actionItems: ["**Use inclusion to strengthen the room, not just soften it.** Your gift is not merely making people feel good, it is making groups better by ensuring important perspectives are not left out. The more clearly you connect inclusion to quality, trust, and performance, the more seriously people will take the strength you naturally bring.", "**Be explicit about the difference between open and undefined.** Welcoming people in does not mean every norm, role, or expectation has to stay loose. Clear standards actually make belonging more sustainable, because people know what they are walking into and how to succeed there.", "**Notice who is consistently on the edge of the conversation.** You often see social dynamics that others miss, especially who gets heard and who quietly disappears. Use that awareness in real time, because a well-timed invitation can change the whole tone and quality of a discussion.", "**Do not let inclusion replace discernment.** Some decisions genuinely require selectivity, prioritization, or a smaller group. You do not betray your values when you acknowledge that healthy inclusion still needs boundaries, purpose, and sometimes a very clear no.", "**Build spaces where you can belong without performing.** You spend a lot of energy helping other people feel included, and that matters. Make sure your own life also has places where you do not have to manage the circle, because you deserve to be held by a community too, not just help create one."] },
  individualization: { n: "Individualization", d: "relationship_building", desc: "You are intrigued with the unique qualities of each person. You figure out how different people can work together.",
    availableTendency: "read people more precisely and customize communication, support, or fit",
    awarenessCue: "the issue is not the system, it is that the approach is wrong for this particular person",
    coreContext: "one-size-fits-all thinking is missing important human detail",
    coreResult: "improve fit, communication, and role alignment",
    defaultTendency: "broader patterns, categories, or standardization",
    introAction: "notice",
    introObject: "what is distinct about each person",
    introPayoff: "so roles, feedback, and collaboration fit the actual human in front of you",
    investmentMove: "keep personalizing where it matters most, not everywhere equally",
    lowDefault: "personalize quickly around individual differences",
    lowMiss: "when better results depend on more tailored communication, support, or role fit",
    lowRisk: "defaulting to broad categories or standardized approaches when nuance mattered",
    naturalTendency: "pick up on individual differences and tailor your approach accordingly",
    overuseCost1: "making simple decisions more customized than they need to be",
    overuseCost2: "weakening comparability or consistency",
    overusePattern1: "you may resist broader systems or categories that would be efficient enough",
    overusePattern2: "you may overweight nuance in one individual and underweight the broader pattern",
    overuseTrigger1: "when tailoring becomes more compelling than standardization",
    overuseTrigger2: "when your read of a person becomes your primary decision lens",
    partnershipCue: "leaning on people who naturally spot individuality and tailor around it",
    supportBenefit: "improve fit without needing personalization to be your default lens",
    supportCondition: "the human detail matters more than the generic rule",
    supportPartner: "people who naturally read the human detail and adjust accordingly",
    supportStructure: "feedback loops, staffing conversations, or tools that surface individual preferences and strengths",
    themePriority: "person-specific tailoring and nuance",
    underuseAdvantage: "sharper people-reading and better fit",
    underuseCost: "mismatched roles, feedback, or collaboration",
    underuseMiss: "teams may rely too heavily on generic assumptions instead of reading the actual person",
    atWork: "You see each person as a unique case. You know what motivates one colleague versus another, how one client likes to receive information versus another, and which team member will thrive in which role.",
    atBest: "You are the ultimate relationship manager. You get the best out of people because you know how each person works. You match people to roles, tailor communications, and build teams that have chemistry because you understand the individual pieces.",
    leanIn: "Share your reads with leadership. When you notice that a colleague would thrive in a different role, say so. When you know a client needs information delivered a certain way, brief the team. Your observations about individuals are strategic intelligence that most people do not have. Make them visible.",
    thrive: "You thrive when you can understand what makes each person distinct and use that insight to create stronger matches, better communication, and more effective relationships. You do your best work when nuance matters and people are treated like individuals rather than generic categories.",
    blindSpots: ["Your attunement to individual differences can make you impatient with one-size-fits-all systems, broad generalizations, or blanket rules that flatten important nuance. That instinct is valuable, but it can also make you resistant to standardization even when some consistency is necessary for scale, fairness, or clarity.", "You may also become so focused on tailoring to the person in front of you that you lose sight of the larger pattern, shared standard, or group need. Not everything can or should be customized indefinitely, and if you are not careful, your strength can turn into over-accommodation that is hard to sustain."],
    actionItems: ["**Turn your observations into usable insight.** You notice what motivates people, what shuts them down, and how they are wired in ways many others miss. Do not keep all of that in your head, because your reads become far more valuable when they help teams staff smarter, communicate better, and avoid preventable friction.", "**Tailor where it matters most.** Not every interaction needs a bespoke approach. Use your customization instinct on the decisions, relationships, and moments where nuance will materially improve trust, performance, or clarity, instead of spending that level of energy everywhere all the time.", "**Respect systems even when they feel blunt.** Standardization can be frustrating for you, especially when you can see a better individualized path. But strong systems and individualized insight do not have to be enemies, and you will often have more influence if you work inside the structure while improving it where it counts.", "**Help other people understand difference without stereotyping it.** You are often good at seeing the distinct shape of a person's strengths, needs, or communication style. When you share that insight carefully, you can help a team get more effective without reducing people to simplistic labels.", "**Use your discernment in your personal life, too.** You are not built for shallow sameness in relationships, and pretending otherwise usually drains you. Let yourself choose environments, friendships, and routines that actually fit who you are instead of assuming every healthy choice has to look the same for everyone."] },
  positivity: { n: "Positivity", d: "relationship_building", desc: "You have contagious enthusiasm. You are upbeat and can get others excited about what they are going to do.",
    availableTendency: "reinforce momentum, help people feel lighter, and reconnect a group to possibility",
    awarenessCue: "the work is technically moving, but the emotional energy has fallen flat",
    coreContext: "morale, energy, or forward spirit matters as much as the literal task",
    coreResult: "make hard work feel more livable and motivating",
    defaultTendency: "realism, neutrality, or seriousness",
    introAction: "lift",
    introObject: "the emotional energy of the room",
    introPayoff: "so people reconnect with momentum, possibility, and one another",
    investmentMove: "keep using optimism as fuel, but do not let it become a shortcut around reality",
    lowDefault: "naturally infuse a room with encouragement, energy, or emotional lift",
    lowMiss: "when a team needs more lift, momentum, or emotional buoyancy",
    lowRisk: "staying too neutral, sober, or realism-heavy",
    naturalTendency: "bring energy, warmth, and encouragement that raises the emotional temperature",
    overuseCost1: "making people feel cheered up before they feel understood",
    overuseCost2: "weakening trust in the depth of the response",
    overusePattern1: "you may unintentionally skip over pain, frustration, or realism",
    overusePattern2: "you may pressure people toward brightness when the moment needs more honesty",
    overuseTrigger1: "when optimism starts to feel safer than naming difficulty",
    overuseTrigger2: "when energy itself becomes the measure of whether the room is okay",
    partnershipCue: "pairing with people who naturally lift morale and re-energize a room",
    supportBenefit: "restore energy without needing positivity to be your default tone",
    supportCondition: "the work has become heavy enough that the group\'s energy is starting to collapse",
    supportPartner: "people who naturally bring energy, optimism, and forward spirit",
    supportStructure: "room for celebration, reinforcement, or moments that intentionally lift morale",
    themePriority: "energy-lifting encouragement and emotional momentum",
    underuseAdvantage: "emotional lift and momentum reinforcement",
    underuseCost: "losing morale, resilience, or forward energy",
    underuseMiss: "the room can become heavier, flatter, or more joyless than it needs to be",
    atWork: "You bring energy. You celebrate wins, you find the silver lining in setbacks, and you make the team environment a place where people actually want to show up. Your enthusiasm is genuine and contagious.",
    atBest: "You are the antidote to burnout. During long campaign stretches and high-stress client periods, your energy keeps the team going. You help people remember why the work matters and why they are good at it.",
    leanIn: "Be intentional about celebrations. When the team hits a milestone, make it visible. When a colleague does good work, name it. Also, your positivity is most powerful when it is specific. 'Great job' is nice. 'The way you handled that client call was exactly what they needed' is transformational.",
    thrive: "You thrive when there is energy to build, momentum to reinforce, and people who are more alive because you are in the room with them. Encouragement energizes you, and you do your best work when your optimism has somewhere useful to go instead of being treated like a personality extra.",
    blindSpots: ["Your ability to lift the temperature of a room can make you too quick to brighten, reframe, or move on when something heavier needs to be acknowledged first. What feels to you like resilience and encouragement can sometimes come across as minimizing, distracting, or unwilling to sit still with discomfort long enough to understand it.", "You may also end up carrying the emotional labor of keeping everyone going. If people come to rely on you as the morale source, your own frustration, sadness, or depletion can go underground until your positivity starts feeling performative even to you."],
    actionItems: ["**Use encouragement with specificity.** Your energy is most powerful when it is attached to something real, a choice someone made, a strength they showed, a win that matters. The more grounded your positivity is, the more it feels like leadership instead of atmosphere.", "**Do not rush past what hurts just because you know how to lighten it.** Your instinct to keep things moving can be helpful, but people trust optimism more when they can feel that reality has been named first. Let the hard thing exist before you try to make it easier to carry.", "**Protect yourself from becoming the team's emotional generator.** You are good at lifting a room, but it should not become your unpaid full-time job. Notice where you are being asked to manage morale in ways that cost you more than people realize.", "**Bring energy where it changes outcomes.** Morale matters, especially in long stretches of pressure, uncertainty, or repetitive work. Use your enthusiasm strategically in the moments where people need stamina, hope, or perspective, not just because silence makes you itch.", "**Make room for your full emotional range.** Being a positive person does not mean being a relentlessly upbeat one. Your life gets more honest and more sustainable when joy is something you genuinely generate, not something you feel obligated to perform."] },
  relator: { n: "Relator", d: "relationship_building", desc: "You enjoy close relationships. You find deep satisfaction in working hard with friends to achieve a goal.",
    availableTendency: "go deeper, strengthen trust, and create durable working relationships",
    awarenessCue: "the relationship is functional, but not yet strong enough to carry harder work",
    coreContext: "depth, trust, and mutual respect matter more than broad reach",
    coreResult: "create stronger collaboration through real relationship",
    defaultTendency: "breadth, newness, or lighter-touch connection",
    introAction: "build",
    introObject: "deeper trust with the right people",
    introPayoff: "so the work can rest on real connection instead of surface rapport",
    investmentMove: "protect the value of depth, but do not let it shrink your range more than the moment requires",
    lowDefault: "move quickly into depth, trust, and real connection with a smaller circle",
    lowMiss: "when the work would benefit from deeper trust instead of broader but thinner connection",
    lowRisk: "favoring range, lightness, or speed over relational depth",
    naturalTendency: "invest deeply in a smaller set of trusted relationships and do your best work there",
    overuseCost1: "making your network narrower than the situation requires",
    overuseCost2: "slowing connection or collaboration with newer relationships",
    overusePattern1: "you may underinvest in new or looser relationships that still matter",
    overusePattern2: "you may stay reserved longer with people outside the inner circle",
    overuseTrigger1: "when depth starts to matter more than range",
    overuseTrigger2: "when trust becomes a prerequisite for full engagement",
    partnershipCue: "leaning on people who naturally deepen trust and build durable relationships",
    supportBenefit: "strengthen key relationships without needing depth to be your default social mode",
    supportCondition: "a key relationship needs more depth, not just more contact",
    supportPartner: "people who naturally build durable trust and deepen important relationships",
    supportStructure: "recurring touchpoints, one-on-one trust-building, or space for more candid relationship work",
    themePriority: "deep trust and durable relationship-building",
    underuseAdvantage: "deeper trust and more durable relationship capital",
    underuseCost: "weakening loyalty, trust, or depth in key relationships",
    underuseMiss: "the work can stay more transactional than it needs to be",
    atWork: "You invest deeply in the people you work with. You prefer a few close, trusted relationships over a large network. Your working relationships feel like genuine friendships and you do your best work alongside people you trust.",
    atBest: "You build the deepest trust on the team. People confide in you. You create partnerships that endure across multiple campaigns and cycles. Your loyalty and reliability make you the person people want on their account.",
    leanIn: "Invest in the relationships that matter most strategically. Deepen your connection with the people you work with most closely, because that trust translates directly into better collaboration, better communication, and better outcomes. Also, be open about the fact that you work best with people you know well. That self-awareness helps managers put you in the right situations.",
    thrive: "You thrive in environments built on trust, depth, and real connection. You do your best work when you can build strong relationships with people you respect and work alongside them toward something meaningful.",
    blindSpots: ["Because you value depth over breadth, you can sometimes invest too narrowly and overlook the importance of building wider networks. Others may read your selectivity as distance, cliquishness, or disinterest when really you are just unwilling to fake connection.", "You may also stay loyal to relationships or dynamics longer than is useful. Once trust is established, it can be hard for you to recalibrate when someone is no longer a strong partner, when a team dynamic has changed, or when honesty would threaten closeness. Without meaning to, you can create an inner-circle effect that makes other people feel like access has to be earned before they can fully belong."],
    actionItems: ["**Invest where trust compounds.** Put your time into the relationships that most directly shape your work, your growth, and your well-being. You are at your strongest when trust is not casual, but built deliberately with people who matter.", "**Let depth be a strength, not a boundary.** You do not need to become a natural networker, but you do need enough range to avoid becoming too dependent on a small circle. Stretch yourself to build a few more meaningful connections than your instinct might choose on its own.", "**Say the hard thing before resentment builds.** Your relationships are strongest when they can hold honesty, not just warmth. If something feels off, address it early instead of protecting the connection so carefully that the real issue goes underground.", "**Leave the gate open a little wider.** Not everyone needs to be in your inner circle, but people should not have to guess whether there is room for them. Small signals of openness can make you more collaborative without asking you to become performatively social.", "**Protect your inner circle without shrinking your world.** It is healthy that not everyone gets the same access to you. Just make sure loyalty is helping you grow, not keeping you in patterns, friendships, or routines that you have already outgrown."] },
  analytical: { n: "Analytical", d: "strategic_thinking", desc: "You search for reasons and causes. You think about all the factors that might affect a situation.",
    availableTendency: "bring rigor, skepticism, and sharper reasoning to decisions",
    awarenessCue: "the room is moving on weak logic or untested assumptions",
    coreContext: "accuracy matters and assumptions need testing",
    coreResult: "separate signal from noise and improve judgment",
    defaultTendency: "instinct, experience, relationships, or values",
    introAction: "test",
    introObject: "assumptions and evidence",
    introPayoff: "so decisions are grounded in what is actually true",
    investmentMove: "use your rigor to sharpen decisions, not to demand impossible certainty",
    lowDefault: "lead with evidence-testing and logic-first scrutiny",
    lowMiss: "when a situation needs more rigor, skepticism, or sharper reasoning",
    lowRisk: "acting on intuition, relationships, or momentum without enough examination",
    naturalTendency: "examine claims, pressure-test ideas, and look for evidence beneath the surface",
    overuseCost1: "slowing action while waiting for more certainty than the situation can provide",
    overuseCost2: "shutting down contributions that needed more space, not less rigor",
    overusePattern1: "you may dismiss emerging ideas too early or stall momentum",
    overusePattern2: "you may sound dismissive before others have fully formed their thinking",
    overuseTrigger1: "when standards for proof become too high for the moment",
    overuseTrigger2: "when something feels vague, emotional, or weakly supported",
    partnershipCue: "partnering with people who naturally interrogate assumptions and ground decisions in evidence",
    supportBenefit: "improve decision quality without needing to live in analysis mode",
    supportCondition: "the stakes are high enough that assumptions need to be checked",
    supportPartner: "people who naturally bring rigor, skepticism, and precision",
    supportStructure: "data, decision criteria, or a process that invites scrutiny",
    themePriority: "evidence-based reasoning and logic-first pressure-testing",
    underuseAdvantage: "disciplined reasoning and clearer evidence",
    underuseCost: "weakening the quality of the decision",
    underuseMiss: "teams can move forward on soft logic or untested assumptions",
    atWork: "You are the person who asks 'what is the evidence?' You challenge assumptions, dig into data, and do not accept claims at face value. You bring rigor to every strategy, recommendation, and deliverable.",
    atBest: "You protect the firm from sloppy thinking. Your insistence on evidence makes the work better. You find the flaw in the plan that everyone else missed. Client recommendations are credible because they are grounded in your analysis.",
    leanIn: "Offer to be the data backbone of your team's strategy work. Build the research brief, run the numbers, pressure-test the assumptions. Also, when you spot a flaw, frame it as a contribution rather than a criticism. 'I found something that could make this stronger' lands better than 'this is wrong,' even though you mean the same thing.",
    thrive: "You thrive when you can examine ideas rigorously, test assumptions, and get underneath the surface of a problem. Clear thinking energizes you, and you do your best work when accuracy matters more than spin, speed, or appearances.",
    blindSpots: ["Your need for evidence can make you skeptical of anything that feels vague, emotional, or insufficiently supported. That discipline is valuable, but in practice it can make you sound dismissive when other people are still exploring, intuiting, or trying to articulate something they do not yet fully understand.", "You may also spend so much time pressure-testing an idea that momentum stalls. Not every situation offers complete information, and if you wait too long for certainty, you can become the person who improves the logic of the plan without helping the team move it forward."],
    actionItems: ["**Use your rigor to strengthen, not shut down.** When you see a flaw, frame it as a way to improve the work rather than a reason to dismiss it. People will hear your insight more clearly when it feels like partnership instead of cross-examination.", "**Name what would be enough evidence.** Do not let analysis become an endless standard that nothing can satisfy. Define what level of proof is actually needed for the decision in front of you, then help the team move once that threshold is met.", "**Do not wait for perfect certainty.** In many situations, the most logical move is to act with 70 percent of the information rather than wait for 100 percent and lose time, relevance, or momentum. Your judgment becomes more valuable, not less, when it helps a team move at the right moment.", "**Translate your thinking for the room you are in.** Your logic may be sound, but if it is delivered too clinically or too densely, people may miss the value of it. The more you can connect your analysis to business impact, risk, timing, or outcomes, the more influential it becomes.", "**Give your mind something real to solve outside of work.** You do not relax by pretending not to think. You relax by thinking about something worthwhile without pressure, whether that is strategy, a rabbit hole, a hard question, or a puzzle that lets your brain do what it naturally does best."] },
  context: { n: "Context", d: "strategic_thinking", desc: "You enjoy thinking about the past. You understand the present by researching its history.",
    availableTendency: "bring historical grounding, precedent, and backstory into the conversation",
    awarenessCue: "people are moving fast, but no one has asked how you got here",
    coreContext: "history matters and people are about to act without understanding what came before",
    coreResult: "improve present decisions with better grounding in the past",
    defaultTendency: "the future, the immediate problem, or the next step",
    introAction: "trace",
    introObject: "the backstory and pattern that led here",
    introPayoff: "so the present is understood before the next move is made",
    investmentMove: "use history to inform the decision, not replace the decision",
    lowDefault: "start with backstory, precedent, or historical pattern",
    lowMiss: "when a situation needs more grounding in what came before",
    lowRisk: "acting as if the current moment appeared out of nowhere",
    naturalTendency: "look backward to understand how the present came to be",
    overuseCost1: "delaying movement by overbuilding context",
    overuseCost2: "making innovation feel more suspect than it needs to",
    overusePattern1: "you may stay in backstory longer than the moment requires",
    overusePattern2: "you may become slower to move on ideas that do not resemble precedent",
    overuseTrigger1: "when explanation becomes more comfortable than decision",
    overuseTrigger2: "when the past becomes the main standard for what is safe or legitimate",
    partnershipCue: "leaning on people who naturally remember the backstory and surface useful precedent",
    supportBenefit: "move forward more intelligently without needing history to be your first instinct",
    supportCondition: "the room is about to make the same mistake because it has forgotten the backstory",
    supportPartner: "people who naturally bring history, precedent, and backstory into the room",
    supportStructure: "timelines, precedent reviews, or institutional memory built into the process",
    themePriority: "historical grounding and pattern-over-time understanding",
    underuseAdvantage: "historical perspective and pattern awareness",
    underuseCost: "repeating avoidable mistakes or misreading the current reality",
    underuseMiss: "people may rush forward without learning from what already happened",
    atWork: "You are the institutional memory. Before you form an opinion, you want to know what has been tried before, what the dynamics have been, and how the current situation came to be. You believe the past is instructive.",
    atBest: "You prevent the team from repeating mistakes. You bring historical perspective that makes current strategies more grounded. You are the person who remembers the backstory that changes the whole conversation.",
    leanIn: "Build and maintain a knowledge base. Document what has worked, what has not, and why. When new team members join or new campaigns launch, offer the historical briefing. Your institutional memory is one of the firm's most undervalued assets, so make it accessible rather than keeping it in your head.",
    thrive: "You thrive when you can understand how the present came to be, trace the backstory that shaped the current reality, and use history to make smarter choices now. You do your best work when the past is treated as useful intelligence rather than dead information.",
    blindSpots: ["Your instinct to look backward for understanding can make you slower to jump into action or more skeptical of ideas that seem detached from precedent. What feels to you like grounding and wisdom can come across as overly cautious, backward-looking, or resistant when others are eager to move faster than the history, patterns, or lessons justify.", "You may also spend so much time building context that you delay the transition from understanding to decision. Knowing how something happened is valuable, but if you are not careful, explanation can quietly become a substitute for change, and the team may feel better informed without actually being any closer to moving."],
    actionItems: ["**Use the backstory to improve the decision in front of you.** Your ability to surface relevant history is a major advantage, especially when people are about to repeat a mistake or miss a critical pattern. The more clearly you connect past lessons to present choices, the more indispensable your context becomes.", "**Distinguish relevant history from interesting history.** You often know or want more background than the room can practically absorb. Curate what matters most so your perspective sharpens the conversation instead of slowing it under the weight of every detail you could include.", "**Help people understand why before you ask them to move.** Many teams rush forward without enough grounding, and you can prevent expensive confusion by filling in the missing backstory. Just make sure the goal of that context is traction, not simply completeness.", "**Do not let precedent quietly veto possibility.** The past has a lot to teach, but it does not get the final vote on what is possible now. Respect history without letting it become an unchallenged argument against adaptation, invention, or a better path.", "**Let your own story inform you without overdefining you.** You are naturally attuned to how the past shapes the present, including your own. That awareness can be grounding, as long as it helps you understand yourself more clearly instead of convincing you that growth is less available than it really is."] },
  futuristic: { n: "Futuristic", d: "strategic_thinking", desc: "You are inspired by the future and what could be. You energize others with vivid visions of possibility.",
    availableTendency: "widen the horizon and create energy around future possibility",
    awarenessCue: "the room is solving today\'s problem without considering tomorrow\'s opportunity",
    coreContext: "the room is too trapped in what already exists",
    coreResult: "create vision, direction, and energy around what comes next",
    defaultTendency: "present reality, tactical execution, or historical grounding",
    introAction: "imagine",
    introObject: "a more compelling future",
    introPayoff: "so the work is not trapped inside the limits of the present",
    investmentMove: "keep bringing the future into view, but tether it to an execution path",
    lowDefault: "start with future possibility and long-range vision",
    lowMiss: "when the room needs a stronger picture of what could exist next",
    lowRisk: "staying too anchored in the present, the tactical, or the already-known",
    naturalTendency: "look ahead, imagine possibilities, and energize around what could exist next",
    overuseCost1: "sounding inspiring but underweighted on what it takes to execute",
    overuseCost2: "underestimating the discipline needed to make it real",
    overusePattern1: "you may lose patience with current realities and constraints",
    overusePattern2: "you may fall in love with a future that is exciting in concept but underbuilt in practice",
    overuseTrigger1: "when the future becomes more emotionally interesting than the present",
    overuseTrigger2: "when the vision gets ahead of the operating plan",
    partnershipCue: "partnering with people who naturally generate vision and future pull",
    supportBenefit: "increase strategic aspiration without having to live in visionary mode",
    supportCondition: "the current limits are being treated as permanent when they are not",
    supportPartner: "people who naturally keep the horizon visible and articulate what could be built",
    supportStructure: "strategy work, brainstorming space, or explicit future-framing",
    themePriority: "future-oriented vision and possibility",
    underuseAdvantage: "vision and long-range possibility",
    underuseCost: "lowering ambition or failing to generate direction",
    underuseMiss: "teams can get stuck in the status quo without anyone widening the horizon",
    atWork: "You are the visionary. You see what the firm could become, what a campaign could accomplish, what the movement could look like in five years. You paint pictures of the future that inspire others.",
    atBest: "You pull the team toward ambitious goals. You help people see beyond the immediate deliverable to the larger possibility. Your vision creates energy and direction, and you are the reason the firm does not get complacent.",
    leanIn: "Share your vision regularly and specifically. Do not just think about the future, articulate it to others. Write the strategy memo that describes where a client could be in three years. Pitch the new service offering. Your ability to see what does not exist yet is rare, and it only becomes powerful when you make it visible.",
    thrive: "You thrive when you can imagine what could exist, articulate a compelling future, and move people toward it. Possibility energizes you, and you do your best work when the horizon is part of the conversation, not just the pressure of what is due this week.",
    blindSpots: ["Your orientation toward what could be can make the present feel dull, limiting, or beneath your full attention. Others may experience you as inspiring and visionary, or as abstract, impatient with current realities, and too ready to leap past the messy constraints that actually shape what is possible.", "You may also become attached to a future that is exciting in concept but underbuilt in execution. If you fall too in love with the vision, you can underestimate the operational discipline, repetition, and tradeoffs required to bring it into the real world."],
    actionItems: ["**Paint the future vividly enough that others can see themselves in it.** Your ideas become most powerful when they are not just exciting to you, but legible to the people who need to help build them. The clearer and more concrete your vision, the easier it is for other people to commit to it.", "**Translate possibility into milestones.** Vision alone rarely moves an organization for long. Pair your future thinking with nearer-term markers so the path feels real, not just inspiring.", "**Respect the present without getting trapped in it.** Current constraints matter, but they do not have to own the whole conversation. Your job is not to ignore reality, it is to stretch the room's sense of what reality could become.", "**Do not confuse a compelling picture with a complete plan.** Your excitement can make a future feel inevitable before the structure exists to support it. Pressure-test the path, not just the promise, so your vision gains credibility as well as energy.", "**Give your imagination somewhere healthy to go outside of work.** You are built to think beyond the immediate, and that can be a joy when it is not always tied to performance. Let yourself dream, design, and imagine in places where possibility is allowed to be nourishing, not just useful."] },
  ideation: { n: "Ideation", d: "strategic_thinking", desc: "You are fascinated by ideas. You find connections between seemingly disparate phenomena.",
    availableTendency: "reframe a problem, produce alternatives, and find unexpected angles",
    awarenessCue: "everyone is solving the problem inside the same tired frame",
    coreContext: "the current thinking is too narrow, repetitive, or stuck",
    coreResult: "create novelty, possibility, and better options",
    defaultTendency: "structure, execution, proof, or narrowing",
    introAction: "generate",
    introObject: "fresh connections and unexpected possibilities",
    introPayoff: "so the room can break out of stale or obvious thinking",
    investmentMove: "keep giving ideas oxygen, but build a handoff into selection and execution",
    lowDefault: "spontaneously generate alternatives, connections, or fresh angles",
    lowMiss: "when the work needs more imagination, reframing, or option generation",
    lowRisk: "staying too linear, too literal, or too constrained by the first workable idea",
    naturalTendency: "connect dots quickly, spin out possibilities, and get energized by new ideas",
    overuseCost1: "making progress harder by continually reopening the field",
    overuseCost2: "producing inspiration without enough follow-through or prioritization",
    overusePattern1: "you may keep generating possibilities after the room needed narrowing",
    overusePattern2: "you may leave others chasing ideas that are interesting but underdeveloped",
    overuseTrigger1: "when newness starts to feel more exciting than usefulness",
    overuseTrigger2: "when the connection itself becomes the reward",
    partnershipCue: "working with people who naturally generate options and reframe stale problems",
    supportBenefit: "expand the field without needing to live in idea-generation mode",
    supportCondition: "the room is trapped inside one path and needs more options",
    supportPartner: "people who naturally generate possibilities and make surprising connections",
    supportStructure: "ideation space followed by prioritization so the ideas can be sorted usefully",
    themePriority: "novelty, possibility, and connection-making",
    underuseAdvantage: "creative reframing and option generation",
    underuseCost: "missing more inventive, strategic, or energizing possibilities",
    underuseMiss: "teams can get trapped in obvious solutions or stale assumptions",
    atWork: "You are the idea person. You make connections others do not see, you generate creative solutions to stuck problems, and you love the moment when a new concept clicks into place.",
    atBest: "You bring innovation. You keep the firm's work fresh and original. You solve problems that linear thinkers cannot crack. You see the creative angle on a campaign or the unexpected coalition opportunity.",
    leanIn: "Create structured brainstorm moments for your team. Your ideas are most powerful when they have a container. Also, learn to quickly sort your own ideas into 'explore now' versus 'park for later,' because your volume of ideas is a feature, not a bug, as long as you help others navigate it.",
    thrive: "You thrive when you can explore possibilities, make unexpected connections, and generate ideas that open up a better path. New concepts energize you, and you do your best work when curiosity, creativity, and pattern recognition have room to operate.",
    blindSpots: ["Your love of ideas can make you impatient with repetition, maintenance, or any phase of work that feels less inventive than the beginning. Others may experience you as creative and invigorating, or as scattered, hard to pin down, and too quick to chase the next interesting thought before the current one has been fully developed.", "You may also generate possibilities faster than a team can absorb them. If you do not help people distinguish between a passing thought, a promising option, and a real priority, your creativity can start to feel like cognitive clutter instead of useful innovation."],
    actionItems: ["**Give your ideas a container.** Your mind works best when it has room to roam, but other people often need more structure than you do. Create a simple way to capture, sort, and revisit ideas so your creativity becomes easier to use instead of harder to track.", "**Differentiate between interesting and important.** Not every good idea needs action right now. One of the biggest upgrades for this strength is learning to separate what is exciting in the moment from what is actually worth resources, time, or attention.", "**Help people follow your leap.** You naturally connect dots that other people do not even see on the page yet. Slow down just enough to show the bridge between those dots so your insight lands as brilliance rather than randomness.", "**Respect the value of development, not just invention.** The first spark matters, but so does what happens after. Partner well with people who like building, refining, and operationalizing ideas so your strongest thinking has a real path into the world.", "**Keep one part of your life purely generative.** You need some space where ideas are allowed to exist before they are judged, monetized, or turned into deliverables. Giving yourself that outlet will make your creativity feel more alive and less like it always has to prove itself immediately."] },
  input: { n: "Input", d: "strategic_thinking", desc: "You have a need to collect and archive. You accumulate information, ideas, and artifacts.",
    availableTendency: "gather context, source material, and useful references that deepen the work",
    awarenessCue: "the team is making a decision off the first available information, not the best available information",
    coreContext: "the situation would benefit from wider information or stronger reference points",
    coreResult: "increase preparedness, resourcefulness, and range",
    defaultTendency: "immediate relevance, faster judgment, or narrower range",
    introAction: "gather",
    introObject: "useful information, examples, and material",
    introPayoff: "so you have more to draw from when the work needs depth or range",
    investmentMove: "keep collecting, but build clearer pathways from material to use",
    lowDefault: "collect broadly just because something may be useful later",
    lowMiss: "when the work needs wider input, stronger references, or more material to draw from",
    lowRisk: "staying too immediate, too sparse, or too narrowly resourced",
    naturalTendency: "collect information, notice what is interesting, and build a mental library over time",
    overuseCost1: "postponing judgment through endless preparation",
    overuseCost2: "leaving others unclear on what matters now or what is actionable",
    overusePattern1: "you may keep gathering after you already have enough to move",
    overusePattern2: "you may accumulate more than you actively share or apply",
    overuseTrigger1: "when collecting starts to feel safer than deciding",
    overuseTrigger2: "when your collection grows faster than your use of it",
    partnershipCue: "relying on people who naturally gather and surface useful information",
    supportBenefit: "bring in richer context without needing to become a human archive",
    supportCondition: "the question is bigger than what is already on the table",
    supportPartner: "people who naturally collect, retain, and surface useful material",
    supportStructure: "collection systems, tagging, or a prompt to gather before deciding",
    themePriority: "broad collection and material-gathering",
    underuseAdvantage: "better context, richer material, and stronger resourcefulness",
    underuseCost: "narrowing the range of what is possible or informed",
    underuseMiss: "the work may rely too heavily on whatever is easiest to access or top of mind",
    atWork: "You are the collector. You read widely, bookmark constantly, and file away facts that might be useful someday. You are the person the team comes to when they need a reference, a stat, or background information.",
    atBest: "You are a walking resource library. Your breadth of knowledge makes you invaluable in strategy sessions and rapid response situations. You connect dots that others cannot because you have more dots to connect.",
    leanIn: "Make your collection accessible. Build shared reference libraries, circulate relevant articles to the team, and offer to do the background research on new accounts. Your knowledge is most valuable when it flows to others, not when it stays in your bookmarks folder.",
    thrive: "You thrive when you can gather useful information, collect what is interesting, and build a mental library that makes you more prepared, resourceful, and expansive over time. You do your best work when curiosity has somewhere to go and what you collect can eventually become valuable to you or others.",
    blindSpots: ["Your instinct to collect can make you keep gathering long after you have enough to move. What feels to you like preparation and curiosity can sometimes look like hoarding, overresearching, or postponing judgment because the next article, example, or insight might still be out there.", "You may also accumulate more than you actively use or share. If your knowledge stays trapped in your notes, bookmarks, files, or head, other people may experience you as full of information but not always clear on what matters now, what is actionable, or what the point of the collection actually is."],
    actionItems: ["**Collect with a use case in mind.** Your appetite for information is a real asset, especially in fast-moving or complex environments. The more intentionally you connect what you gather to likely decisions, audiences, or future needs, the more strategic your curiosity becomes.", "**Turn accumulation into access.** You know more than people often realize, but the value of your strength increases when others can benefit from it too. Build habits that help you surface, share, and organize what you know so your collection becomes a resource rather than a private archive.", "**Notice when gathering is replacing deciding.** Sometimes more input genuinely helps, and sometimes it delays the discomfort of closing the loop. Ask yourself whether one more source is likely to change the conclusion or just postpone the moment you have to make a call.", "**Curate, do not just accumulate.** One of the highest forms of this strength is not collecting everything, it is knowing what is most relevant, timely, and useful. Your judgment becomes more powerful when you help people see the signal inside all the material you naturally absorb.", "**Let curiosity be restorative, not just productive.** You do not need every interest to justify itself. Some of the healthiest expression of this strength comes from letting yourself read, explore, or gather simply because it keeps your mind alive."] },
  intellection: { n: "Intellection", d: "strategic_thinking", desc: "You are characterized by intellectual activity. You are introspective and appreciate time for musing and reflection.",
    availableTendency: "slow down, think more fully, and generate better insight through reflection",
    awarenessCue: "the conversation is moving fast, but the thinking is staying shallow",
    coreContext: "the issue is complex enough that quick processing will miss something important",
    coreResult: "produce deeper, more considered thinking",
    defaultTendency: "speed, discussion, or external processing",
    introAction: "think through",
    introObject: "a question, idea, or tension deeply",
    introPayoff: "so the insight is real, not rushed",
    investmentMove: "keep protecting reflection, but create clearer bridges back into shared decision-making",
    lowDefault: "slow down to think something through deeply before acting or speaking",
    lowMiss: "when a problem needs more reflection, interior processing, or conceptual depth",
    lowRisk: "overreliance on quick external processing or immediate conclusions",
    naturalTendency: "process inwardly, reflect deeply, and follow ideas beyond the obvious first answer",
    overuseCost1: "making others unsure whether progress is happening",
    overuseCost2: "leaving others without enough access to what you are seeing",
    overusePattern1: "you may stay in inner processing longer than the moment allows",
    overusePattern2: "you may become harder to read or slower to externalize useful thinking",
    overuseTrigger1: "when reflection becomes more comfortable than action",
    overuseTrigger2: "when you assume depth requires distance from the room",
    partnershipCue: "leaning on people who naturally process deeply and bring slower insight to the room",
    supportBenefit: "increase depth without forcing yourself to live in internal processing mode",
    supportCondition: "the issue is important enough that the first answer is probably too shallow",
    supportPartner: "people who naturally think deeply and help surface slower insight",
    supportStructure: "think time, writing space, or quieter processing before discussion",
    themePriority: "deep reflection and inward processing",
    underuseAdvantage: "reflective depth and better-formed insight",
    underuseCost: "lowering the quality of insight",
    underuseMiss: "important questions may get answered too quickly or too shallowly",
    atWork: "You are the deep thinker. You need time alone to process, reflect, and arrive at your conclusions. Your best ideas do not come in the meeting. They come later, after you have had time to turn the problem over in your mind.",
    atBest: "When you speak, it is considered and insightful. You see angles others miss because you have spent more time thinking about the problem than anyone else. Your depth compensates for speed and often produces the breakthrough.",
    leanIn: "Ask for what you need. Request agendas in advance. Block thinking time on your calendar. And when you arrive at an insight after a meeting, share it. Send the follow-up email, drop the Slack message, schedule the five-minute check-in. Your thinking is too valuable to stay in your head.",
    thrive: "You thrive when you have space to think deeply, turn ideas over fully, and follow a question past the obvious first answer. You do your best work when reflection is treated as real work and your inner life has enough room to produce the insight it is capable of.",
    blindSpots: ["Your depth can make you slower to externalize your thinking, especially when the idea is still forming. Others may experience you as thoughtful and perceptive, or as hard to access, overly private, and absent from the conversation until after the moment when your insight would have been most useful.", "You may also stay in your head so long that reflection starts to substitute for movement. Thinking is one of your strengths, but if you are not careful, it can become a protected internal world where ideas feel more complete than they actually are once they meet other people, deadlines, or reality."],
    actionItems: ["**Claim thinking time before the day takes it from you.** Your best work rarely comes from constant interruption and instant reaction. Protecting time to process is not indulgent for you, it is one of the main ways your strongest insight gets produced.", "**Externalize earlier than is comfortable.** You do not need to wait until the thought is perfect before sharing it. Letting other people into your thinking sooner gives them something to build with and keeps your best ideas from arriving after the decision has already passed.", "**Translate depth into usefulness.** You can go further inward than many people can follow on their own. The more clearly you connect your reflection to practical implications, options, or decisions, the more influence your inner work will have in the outer world.", "**Do not let privacy become unnecessary distance.** It is natural for you to keep a lot of your process inside, but that can make collaboration harder than it needs to be. Small windows into what you are considering can build trust without asking you to become performatively open.", "**Give your mind somewhere honest to wander.** You need more than productivity to feel mentally alive. Whether it is writing, reading, long walks, or turning over ideas without a deadline attached, make sure part of your life still gives thought room to breathe."] },
  learner: { n: "Learner", d: "strategic_thinking", desc: "You have a great desire to learn and continuously improve. The process of learning excites you more than the outcome.",
    availableTendency: "stay curious, keep developing, and help the work keep growing rather than plateauing",
    awarenessCue: "the work is repeating itself and capability is no longer expanding",
    coreContext: "growth, novelty, and increasing capability matter more than simply repeating the known",
    coreResult: "expand competence and keep the work evolving",
    defaultTendency: "practicality, application, or relevance over exploration",
    introAction: "stretch into",
    introObject: "something new",
    introPayoff: "so growth itself becomes part of the energy of the work",
    investmentMove: "keep honoring growth, but make sure learning keeps turning into useful capability",
    lowDefault: "learn continuously for the sake of growth itself",
    lowMiss: "when the work needs more curiosity, capability-building, or openness to learning",
    lowRisk: "preferring immediate relevance or application over broader development",
    naturalTendency: "build capability continuously and feel energized by learning as a process",
    overuseCost1: "delaying use or mastery because the next thing is more energizing",
    overuseCost2: "chasing learning while neglecting consolidation",
    overusePattern1: "you may stay in growth mode even after enough capability is already in place",
    overusePattern2: "you may undervalue depth, repetition, or maintenance work",
    overuseTrigger1: "when learning becomes the reward more than application",
    overuseTrigger2: "when progress is defined only by newness",
    partnershipCue: "leaning on people who naturally keep learning, growth, and development active",
    supportBenefit: "keep the work developing without needing learning to be its own reward",
    supportCondition: "the role or project is starting to stagnate because no one is stretching",
    supportPartner: "people who naturally keep curiosity and growth alive",
    supportStructure: "learning goals, development plans, or explicit space to build new skill",
    themePriority: "active learning and capability-building",
    underuseAdvantage: "ongoing growth and curiosity",
    underuseCost: "missing capability gains that would have strengthened performance",
    underuseMiss: "the work can become static, overfamiliar, or underdeveloped",
    atWork: "You are energized by the process of learning itself. You actively seek out new skills, new subjects, and new tools. You are one of the first to adopt a new platform or explore a new approach.",
    atBest: "You are the team's growth engine. Your curiosity drives continuous improvement. You bring new approaches and fresh perspectives because you are always learning, and you model what it looks like to stay relevant in a changing field.",
    leanIn: "Teach what you learn. When you pick up a new skill or approach, share it with the team. Offer to lead a lunch-and-learn, write a brief, or build a template. Your learning becomes exponentially more valuable when it spreads beyond you.",
    thrive: "You thrive when you are stretching into something new, building capability, and feeling your understanding expand in real time. You do your best work when growth is active, curiosity is rewarded, and the process of learning is part of the energy, not just a means to an end.",
    blindSpots: ["Your love of learning can make you more excited by the beginning of mastery than the long middle of application. What feels to you like healthy curiosity can sometimes look like restlessness, constant tool-switching, or an appetite for novelty that outruns the discipline required to turn knowledge into repeatable value.", "You may also overinvest in learning for its own sake without being clear on what it is serving. Not every course, framework, article, or new skill needs to become part of your life, and if you are not careful, perpetual growth can become a way to feel productive without actually consolidating what you already know."],
    actionItems: ["**Tie learning to real leverage.** Your growth mindset is powerful, especially in environments that change quickly. The more intentionally you connect what you are learning to business needs, career direction, or a current challenge, the more your curiosity compounds instead of scattering.", "**Finish the learning cycle with application.** New knowledge lights you up, but the real return comes when you use it, teach it, or build something with it. Make it a habit to ask how this learning will show up in your work before you move on to the next fascinating thing.", "**Respect repetition as part of mastery.** The most exciting part for you may be the moment when something is new, but your real advantage grows when you stay with it long enough to internalize it. Depth often arrives after the novelty wears off.", "**Share what you pick up.** You are often early to tools, ideas, frameworks, or shifts that other people have not absorbed yet. When you turn your learning outward through teaching, synthesizing, or creating shortcuts for others, your strength becomes far more scalable and influential.", "**Let growth support your life, not quietly dominate it.** You do not need to optimize every corner of yourself all the time. Some seasons of life are for expansion, and some are for integration, and knowing the difference will make your curiosity feel a lot less frantic."] },
  strategic: { n: "Strategic", d: "strategic_thinking", desc: "You create alternative ways to proceed. Faced with any scenario, you quickly spot the relevant patterns and issues.",
    availableTendency: "sort complexity, find options, and help others move toward the most useful route",
    awarenessCue: "there are several possible routes, but the room is treating the first one as the only one",
    coreContext: "the situation is complex and there are multiple possible paths",
    coreResult: "create direction by seeing which path is most viable",
    defaultTendency: "action, structure, or direct execution over pathfinding",
    introAction: "spot",
    introObject: "the most useful path through complexity",
    introPayoff: "so people can move with more intelligence and less wandering",
    investmentMove: "keep finding the path, but make your thinking more legible so others can move with you",
    lowDefault: "instinctively see patterns and identify the best route through complexity",
    lowMiss: "when the work needs more pathfinding, pattern recognition, or option-sorting",
    lowRisk: "overreliance on direct execution or local problem-solving without enough landscape view",
    naturalTendency: "read the landscape quickly, see patterns, and identify workable paths forward",
    overuseCost1: "making the strategy sharper than the follow-through",
    overuseCost2: "leaving others impressed by the answer but unsure how you got there",
    overusePattern1: "you may stay at the level of pathways and pattern-reading without enough execution ownership",
    overusePattern2: "you may skip over explanation or patience",
    overuseTrigger1: "when seeing options becomes easier than committing to one",
    overuseTrigger2: "when you move so quickly to the likely path that others have not caught up",
    partnershipCue: "leaning on people who naturally read the landscape and see better paths through it",
    supportBenefit: "make better directional choices without needing strategy to be your first reflex",
    supportCondition: "the room is moving, but no one is really reading the full landscape",
    supportPartner: "people who naturally sort complexity and identify useful pathways",
    supportStructure: "decision maps, scenario planning, or time to compare options before committing",
    themePriority: "strategic pattern-reading and route selection",
    underuseAdvantage: "faster pathfinding and clearer pattern-reading",
    underuseCost: "choosing a path that is more obvious than effective",
    underuseMiss: "the group can move without enough sense of the landscape or the available routes",
    atWork: "You are the chess player. You see the whole board, think multiple moves ahead, and quickly identify the path with the best odds. You sort through clutter, discard dead ends, and find the route others would not have seen.",
    atBest: "You make the firm smarter. Your ability to see patterns, anticipate reactions, and evaluate options makes every strategy you touch sharper. You save the team time by identifying the best path faster than a committee could.",
    leanIn: "Make your strategic thinking visible. When you see the path, walk others through your reasoning so they can follow your logic and learn from it. Also, offer to do the strategic review on accounts that feel stuck. Your ability to quickly generate and evaluate options is exactly what those situations need.",
    thrive: "You thrive when there is complexity to sort through, patterns to spot, and multiple paths to evaluate before choosing the one with the best odds. You do your best work when thinking ahead matters and your ability to see the shape of the situation can help everyone move smarter.",
    blindSpots: ["Your pattern recognition can make you impatient with linear thinking, slow consensus-building, or people who need more time to understand what you already see. What feels to you like clarity and efficiency can come across as abrupt, overly certain, or difficult to follow when you jump to the conclusion before the rest of the room has seen the map.", "You may also become overly attached to staying two steps ahead. If you spend too much energy gaming outcomes and anticipating variables, you can overcomplicate simple decisions, default to control, or unintentionally create distance from people who need more transparency and less quiet calculation."],
    actionItems: ["**Walk people through the path you see.** Your mind often gets to the answer faster than others can track how you arrived there. The more you make your reasoning visible, the more your strategy becomes usable to the team instead of living as a private advantage inside your own head.", "**Use optionality without living in endless contingency mode.** Seeing multiple possible paths is one of your great strengths, but not every decision needs five backup scenarios. Focus your strategic depth on the moments where the complexity truly matters rather than treating every choice like a chess board.", "**Do not confuse speed of insight with inevitability.** You are often right early, but being early is not the same thing as being complete. Leave enough room for new information to sharpen the route before you lock too hard onto the first strong path you spot.", "**Let clarity become collaboration.** You can save people a lot of wasted motion when you help them see the best route faster. Your influence grows even more when others feel like your strategy includes them, not just outthinks them.", "**Give yourself places where not everything has to be optimized.** You are wired to look for the best path, the cleanest route, the smartest move. That is useful, but it can also make life feel like a sequence of problems to solve instead of something you are allowed to simply inhabit sometimes."] },
};
var ALL_T = Object.keys(TH);

/* ---- REVEAL DATA (percentages, characters) ---- */
var REVEAL_DATA = {
  achiever:{pct:31,fic:"Rocky Balboa",real:"Arianna Huffington"},
  activator:{pct:8,fic:"John Keating (Dead Poets Society)",real:"Steve Jobs"},
  adaptability:{pct:16,fic:"Forrest Gump",real:"Andy Warhol"},
  analytical:{pct:8,fic:"Spock",real:"Michael Burry"},
  arranger:{pct:12,fic:"Danny Ocean (Ocean's Eleven)",real:"Martha Stewart"},
  belief:{pct:11,fic:"Captain America",real:"Martin Luther King Jr."},
  command:{pct:5,fic:"General George Patton",real:"Margaret Thatcher"},
  communication:{pct:10,fic:"Tyrion Lannister",real:"Winston Churchill"},
  competition:{pct:7,fic:"Katniss Everdeen",real:"Michael Jordan"},
  connectedness:{pct:11,fic:"Rafiki (The Lion King)",real:"Paulo Coelho"},
  consistency:{pct:10,fic:"Ned Stark",real:"Colin Powell"},
  context:{pct:9,fic:"Robin (Stranger Things)",real:"David McCullough"},
  deliberative:{pct:6,fic:"Batman",real:"Janet Yellen"},
  developer:{pct:16,fic:"Mr. Miyagi",real:"Oprah Winfrey"},
  discipline:{pct:4,fic:"Monica Geller",real:"Marie Kondo"},
  empathy:{pct:19,fic:"Deanna Troi (Star Trek)",real:"Mother Teresa"},
  focus:{pct:6,fic:"Legolas",real:"Serena Williams"},
  futuristic:{pct:7,fic:"Doc Brown (Back to the Future)",real:"Elon Musk"},
  harmony:{pct:14,fic:"Mahatma Gandhi",real:"Dolly Parton"},
  ideation:{pct:12,fic:"Tony Stark",real:"Walt Disney"},
  includer:{pct:9,fic:"Snow White",real:"Jimmy Carter"},
  individualization:{pct:10,fic:"Mary Poppins",real:"Lin-Manuel Miranda"},
  input:{pct:14,fic:"Indiana Jones",real:"Maria Popova"},
  intellection:{pct:13,fic:"Lisa Simpson",real:"Albert Einstein"},
  learner:{pct:29,fic:"Hermione Granger",real:"Bill Gates"},
  maximizer:{pct:8,fic:"Miranda Priestly",real:"Tiger Woods"},
  positivity:{pct:13,fic:"Leslie Knope",real:"Richard Branson"},
  relator:{pct:27,fic:"Samwise Gamgee",real:"Fred Rogers"},
  responsibility:{pct:28,fic:"Atticus Finch",real:"Warren Buffett"},
  restorative:{pct:15,fic:"MacGyver",real:"Gordon Ramsay"},
  self_assurance:{pct:4,fic:"Han Solo",real:"Simon Cowell"},
  significance:{pct:5,fic:"Alexander Hamilton",real:"Muhammad Ali"},
  strategic:{pct:22,fic:"Sherlock Holmes",real:"Jeff Bezos"},
  woo:{pct:8,fic:"Jay Gatsby",real:"Bill Clinton"},
};

var DOMAIN_GRADIENTS = {
  executing: "linear-gradient(150deg, #1a0a2e 0%, #4c1d95 30%, #7c3aed 60%, #8b5cf6 100%)",
  influencing: "linear-gradient(150deg, #2a0a0a 0%, #7f1d1d 30%, #dc2626 60%, #ef4444 100%)",
  relationship_building: "linear-gradient(150deg, #0a1628 0%, #1e3a5f 30%, #2563eb 60%, #3b82f6 100%)",
  strategic_thinking: "linear-gradient(150deg, #022c22 0%, #064e3b 30%, #059669 60%, #10b981 100%)",
};

var GRAIN = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")";

/* ---- QUESTIONS: Gallup mapping ---- */
/* [id, textA, textB, [themesA], [themesB], phase] */
/* Each side maps to ONE theme (or occasionally a split). */
/* Intensity checks: both sides same theme, see INTENSITY_HIGH_RIGHT */
var Q = [
  [1,"My friends ask me to tell stories.","My friends ask my advice.",["communication"],["individualization"],"c"],
  [2,"I am a perfectionist.","I am a person who gets things done.",["maximizer"],["achiever"],"c"],
  [3,"I like spending time with futurists.","I like spending time with historians.",["futuristic"],["context"],"c"],
  [4,"I strive to win first place.","I enjoy playing the game.",["competition"],["harmony"],"c"],
  [5,"I have always worked hard.","I am a slow, but steady performer.",["achiever"],["deliberative"],"c"],
  [6,"I think about what I do well.","I think about what I must improve.",["maximizer"],["restorative"],"c"],
  [7,"I am a sensitive person.","I am a logical person.",["empathy"],["analytical"],"c"],
  [8,"I can pick out just the right gift.","I give gifts that anyone would like.",["individualization"],["consistency"],"c"],
  [9,"Starting conversations is an effort for me.","I get a rush from striking up a conversation with a stranger.",["relator"],["woo"],"c"],
  [10,"I feel great about life.","I feel I am a competent person.",["positivity"],["self_assurance"],"c"],
  [11,"I am patient when someone struggles.","I think people do better when someone pushes them.",["developer"],["command"],"c"],
  [12,"I can make people feel important to me.","I can make people feel successful.",["relator"],["significance"],"c"],
  [13,"My view of humanity guides my life.","My ambition guides my life.",["belief"],["significance"],"c"],
  [14,"I find it satisfying when people confide in me.","I want to be a leader of others.",["relator"],["command"],"c"],
  [15,"I like to follow steps.","I love looking at things from different angles.",["discipline"],["ideation","strategic"],"c"],
  [16,"I am happiest when things are running smoothly.","I am happiest when I have a problem to solve.",["discipline"],["restorative"],"c"],
  [17,"Following proven methods keeps me from mistakes others have made.","I am good at reorganizing things to be more efficient.",["consistency"],["arranger"],"c"],
  [18,"Everyday I talk about my visions for the future.","I set aside planning times to think about the future.",["ideation"],["focus"],"c"],
  [19,"I can get other people excited.","I can calm others down.",["activator"],["deliberative"],"c"],
  [20,"Once I have made a decision, I have to act.","I need to be sure I am right before I take action.",["activator"],["deliberative"],"c"],
  [21,"I concentrate harder than most people on what I want to get done.","I go with the flow and keep an overview of issues.",["focus"],["adaptability"],"c"],
  [22,"Everything happens for a reason.","Coincidences are random and have no special meaning.",["connectedness"],["analytical","strategic"],"c"],
  [23,"I am a good conversationalist.","I am a good listener.",["communication"],["relator"],"c"],
  [24,"It is natural for me to accept everybody.","I tend to carefully select the people I spend time with.",["includer"],["relator"],"c"],
  [25,"I always find new things that capture my interest.","My friends have seldom disappointed me.",["learner","input"],["relator"],"c"],
  [26,"I rely on experts to help me find the right answers.","I am a creative, strategic thinker and patterns naturally emerge for me.",["analytical"],["strategic","ideation"],"c"],
  [27,"I am fully alive, full of joy and delight.","I am aware of all the factors affecting the situation.",["positivity"],["analytical"],"c"],
  [28,"I want to lead a large group of people.","I help people see how they are connected.",["command"],["connectedness"],"c"],
  [29,"I sometimes intimidate others.","Well-known leaders intimidate me.",["command"],["self_assurance"],"c"],
  [30,"I can put myself into someone's life and understand what they are going through.","I have an ability to love all people.",["empathy"],["connectedness"],"c"],
  [31,"I push others to succeed.","I make other people happy.",["command","activator"],["developer","harmony"],"c"],
  [32,"I am a carefree person.","I am more mature than my associates and friends.",["adaptability"],["self_assurance"],"c"],
  [33,"I act on every opportunity.","I am careful to avoid making mistakes.",["activator"],["deliberative"],"c"],
  [34,"By studying history I can figure out the future.","My future will be independent of my past.",["context"],["futuristic"],"c"],
  [35,"I am part of something larger than myself.","I am a realistic person.",["connectedness"],["analytical"],"c"],
  [36,"I want work to be a way of life for me.","Work is just a way to earn a living.",["belief"],["achiever"],"c"],
  [37,"I feel sad when someone doesn't like me.","I feel guilty when I do anything that I don't think is right.",["empathy"],["responsibility"],"c"],
  [38,"I organize.","I analyze.",["arranger"],["analytical"],"c"],
  [39,"I am spontaneous.","I am practical.",["adaptability"],["deliberative"],"c"],
  [40,"I seek out philosophical people.","I like to associate with hardworking, achieving people.",["intellection"],["achiever"],"c"],
  [41,"I enjoy making others feel worthwhile.","I enjoy making others feel successful.",["developer"],["significance"],"c"],
  [42,"I use instinct to solve problems.","I use exact, well-researched information.",["strategic"],["analytical"],"c"],
  [43,"I have a healthy skepticism about life.","I believe I am connected with all of humankind.",["analytical"],["connectedness"],"c"],
  [44,"I like to take things apart.","If it's not broken, don't fix it.",["restorative"],["consistency"],"c"],
  [45,"I prefer to be around people like me.","I feel bad when other people are left out.",["relator"],["includer"],"c"],
  [46,"I can keep up with most people and am not driven to work harder or longer.","I have great stamina and have always worked harder and longer than most.",["achiever"],["achiever"],"c"],
  [47,"A bigger title motivates me.","A bigger mission motivates me.",["significance"],["belief"],"c"],
  [48,"I am a very tidy person.","I am very stubborn.",["discipline"],["command"],"c"],
  [49,"People often share their feelings with me.","I tend to have an objective outlook.",["empathy"],["analytical"],"c"],
  [50,"I follow a written plan for my future.","I discover the future one day at a time.",["focus"],["adaptability"],"c"],
  [51,"I focus on what I can achieve in the future.","I imagine how I will respond to whatever happens.",["focus"],["strategic"],"c"],
  [52,"I stay connected to my long-term friends.","I am continually expanding my network of friends.",["relator"],["woo"],"c"],
  [53,"I include everybody so I don't hurt anyone's feelings.","I select my friends carefully.",["includer"],["relator"],"c"],
  [54,"My ego is not so large that I need to be recognized.","It is very important to me to be recognized as credible and successful.",["significance"],["significance"],"c"],
  [55,"I enjoy understanding the causes of major wars.","I enjoy thinking about what the world will be like in fifty years.",["context"],["futuristic"],"c"],
  [56,"I am analytical about issues facing my life.","I am passionate about issues that affect my life.",["analytical"],["belief"],"c"],
  [57,"I make progress by capitalizing on my talents.","I make progress by overcoming my weaknesses.",["maximizer"],["restorative"],"c"],
  [58,"For me everything has to be planned.","I prefer to go with the flow.",["discipline"],["adaptability"],"c"],
  [59,"I find different ways to get things done.","I prefer routine ways for getting things done.",["arranger"],["discipline"],"c"],
  [60,"I feel bad when other people are left out.","My favorite times are when I am with good friends.",["includer"],["relator"],"c"],
  [61,"I judge people based on their character.","I welcome everyone.",["individualization"],["includer"],"c"],
  [62,"I think most people will steal if the conditions are right.","I believe that people who steal should be punished.",["significance"],["belief"],"c"],
  [63,"What happens today is the result of history.","We invent the future one day at a time.",["context"],["adaptability"],"c"],
  [64,"I love it when things are working perfectly.","I love the process of fixing things.",["maximizer"],["restorative"],"c"],
  [65,"I rely on experts to help me find the right answers.","Answers and issues naturally emerge for me to see.",["analytical"],["strategic"],"c"],
  [66,"I am very generous in giving praise.","I am selective in giving praise.",["developer"],["maximizer"],"c"],
  [67,"I am never fully satisfied unless I am number one.","I am happy to be among the top group.",["competition"],["competition"],"c"],
  [68,"I am good at figuring out how different people can work together.","I am good at treating everyone equally.",["arranger"],["consistency"],"c"],
  [69,"I try to stay within my comfort zone.","I am a thrill-seeker.",["deliberative"],["activator"],"c"],
  [70,"I can sense other people's feelings.","I enjoy discussing big ideas.",["empathy"],["ideation","intellection"],"c"],
  [71,"I am always thinking about how to be more efficient.","I follow a regular routine.",["arranger"],["discipline"],"c"],
  [72,"I trust my heart for important decisions.","I use my head for important decisions.",["empathy","belief"],["analytical"],"c"],
  [73,"I respond to things as they occur.","I prioritize things, then act.",["adaptability"],["focus"],"c"],
  [74,"I like everybody.","I want everybody to like me.",["includer"],["woo"],"c"],
  [75,"I am driven by my goals.","I am driven by my mission.",["focus"],["belief"],"c"],
  [76,"I set performance objectives each week.","My work is determined by the demands of the day.",["discipline"],["adaptability"],"c"],
  [77,"I like to take care of the present.","I live for the future.",["adaptability"],["futuristic"],"c"],
  [78,"I have to force myself to study.","I can concentrate on the things in which I am interested.",["discipline"],["learner"],"c"],
  [79,"Being trustworthy is important.","Being successful is important.",["responsibility"],["significance"],"c"],
  [80,"I accept what life gives me.","I like to get perspective by seeing patterns emerge.",["adaptability"],["strategic"],"c"],
  [81,"I study what motivates other people.","I am introspective.",["individualization"],["intellection"],"c"],
  [82,"I follow a routine.","I am zestful.",["discipline"],["positivity"],"c"],
  [83,"I read about social issues in my free time.","I watch sports or entertainment to unwind.",["belief"],["adaptability"],"c"],
  [84,"I like to be heard.","I like to listen.",["communication"],["relator"],"c"],
  [85,"It is always best to be careful.","I am an open-minded person.",["deliberative"],["adaptability"],"c"],
  [86,"I am satisfied with my progress in life.","I worry about my future.",["achiever"],["futuristic"],"c"],
  [87,"I like to talk.","I like to think.",["communication"],["intellection"],"c"],
  [88,"I pay close attention to people's feelings.","I pay close attention to details.",["empathy"],["discipline"],"c"],
  [89,"I am a very down to earth thinker.","I am a creative, strategic thinker.",["analytical"],["strategic"],"c"],
  [90,"I seek out people who will be honest about my weaknesses.","I choose to associate with people who appreciate my strengths.",["self_assurance"],["individualization"],"c"],
  [91,"I have to take care of myself first.","I feel a need to sacrifice for others.",["self_assurance"],["responsibility"],"r"],
  [92,"I am extremely social.","I like to work hard with friends.",["woo"],["achiever"],"r"],
  [93,"I am never at a loss for words.","It is hard for me to talk about myself.",["communication"],["intellection"],"r"],
  [94,"I am a carefree person.","I am a serious person.",["adaptability"],["deliberative"],"r"],
  [95,"I love to study.","I live to go out.",["learner"],["woo"],"r"],
  [96,"I am often forgetful.","My nature is to check as often as necessary to be sure everything is in order.",["adaptability"],["discipline"],"r"],
  [97,"I am a keen observer of the differences between people.","I treat all people equally.",["individualization"],["consistency"],"r"],
  [98,"Overcoming weaknesses is my way for achieving.","Building on my talents is my way for achieving.",["restorative"],["maximizer"],"r"],
  [99,"When something goes wrong, I see an opportunity.","Problems cause me a lot of stress.",["activator","strategic"],["deliberative"],"r"],
  [100,"I am outgoing.","I can be outgoing when I need to be.",["woo"],["relator"],"r"],
  [101,"I want as many friends as possible.","I want a few deep friendships that are very important to me.",["woo"],["relator"],"r"],
  [102,"It is sometimes justifiable to bend the truth.","It is never justifiable to tell a lie.",["strategic"],["responsibility","belief"],"r"],
  [103,"I want a few friends that I know a lot about.","I am always building new friendships.",["relator"],["woo"],"r"],
  [104,"I have been known for my neatness.","I have been known for my sense of humor.",["discipline"],["positivity"],"r"],
  [105,"I am creating my future.","I study what the future holds for me.",["activator"],["context"],"r"],
  [106,"I like to challenge people.","I like to encourage people.",["command"],["developer"],"r"],
  [107,"I am a very private person.","My life is an open book.",["intellection","relator"],["communication"],"r"],
  [108,"I am generous.","I am a thrifty person.",["developer"],["discipline"],"r"],
  [109,"I am a leader.","I am a high achiever.",["command"],["achiever"],"r"],
  [110,"I sometimes flatter others.","I am conscientious.",["woo"],["responsibility"],"r"],
  [111,"I can study for as long as it takes.","I have a really short attention span.",["learner"],["focus"],"r"],
  [112,"I am careful not to give out too much praise, so when I do it really means something.","I am generous with my praise and recognition.",["maximizer"],["developer"],"r"],
  [113,"I like large gatherings where everyone is welcomed.","I like small gatherings with close friends.",["includer"],["relator"],"r"],
  [114,"I have a purpose for my life.","My life is very enjoyable.",["belief"],["positivity"],"r"],
  [115,"I enjoy philosophical discussions.","I enjoy goal-setting conferences.",["intellection"],["focus"],"r"],
  [116,"I like to be alone.","I am missing my friends.",["intellection"],["relator"],"r"],
  [117,"I visualize the future.","I understand what caused the present circumstances.",["futuristic"],["context"],"r"],
  [118,"It is easy for me to admit the truth about myself.","I struggle to be honest with myself.",["self_assurance"],["intellection"],"r"],
  [119,"I am not afraid to talk about who I am.","I am very careful in talking about my private life.",["communication"],["intellection"],"r"],
  [120,"As a child, I was quite aggressive and independent.","As a child, I fit in well and caused no problems.",["command"],["harmony"],"r"],
  [121,"I'd rather plan the party.","I'd rather go to the party.",["communication"],["woo"],"r"],
  [122,"My actions are guided by my values.","I am always open to new experiences.",["belief"],["adaptability"],"r"],
  [123,"I encourage others to think things through.","I encourage others to take action.",["intellection"],["activator"],"r"],
  [124,"I seek the guidance of others.","No matter the situation, I naturally know the right thing to do.",["individualization"],["self_assurance"],"r"],
  [125,"People who have not figured out their goals irritate me.","I don't like to be around people who can't relax.",["focus"],["discipline"],"r"],
  [126,"I choose easy courses.","I choose challenging courses.",["learner"],["learner"],"r"],
  [127,"I dislike deadlines.","My responsibility keeps me going.",["adaptability"],["responsibility"],"r"],
  [128,"I encourage people.","I strengthen people.",["developer"],["maximizer"],"r"],
  [129,"I am too trusting of others.","I am too ambitious.",["empathy"],["significance"],"r"],
  [130,"What has happened in the past inspires me.","What can be achieved in the future inspires me.",["context"],["futuristic"],"r"],
  [131,"Last minute pressure focuses my mind.","My thinking is clearer when I get things done ahead of time.",["adaptability"],["discipline"],"r"],
  [132,"I think most people will steal if the conditions are right.","I believe that people who steal should be punished.",["analytical"],["belief"],"r"],
  [133,"I need to feel excited about my work.","Acceptance is my greatest need.",["activator"],["includer"],"r"],
  [134,"I am a reasonable person.","I am a responsible person.",["analytical"],["responsibility"],"r"],
  [135,"Most of my thoughts are with the here and now.","I try to learn as much as I can by studying the past.",["adaptability"],["context"],"r"],
  [136,"I am satisfied when I do the best I can.","I am driven to make a difference in the world.",["achiever"],["significance"],"r"],
  [137,"I have a great desire to learn.","I need to be known and understood.",["learner"],["significance"],"r"],
  [138,"I think a lot about cause and effect.","I take things as they come.",["analytical"],["adaptability"],"r"],
  [139,"Figuring out why I failed.","Enjoying present successes.",["analytical"],["positivity"],"r"],
  [140,"Helping others fills me with purpose.","People should be free to live the life they choose.",["connectedness"],["individualization"],"r"],
  [141,"I seek responsibility.","I strive for promotions.",["responsibility"],["significance"],"r"],
  [142,"I am agreeable with people.","I take risks.",["harmony"],["activator"],"r"],
  [143,"I spend 25% of my time thinking about the future.","I spend 70% of my time thinking about the future.",["strategic"],["strategic"],"r"],
  [144,"I inspire friends to make things happen.","I bring harmony to people who are working together.",["activator"],["harmony"],"r"],
  [145,"I like things that are predictable.","I find change exciting.",["consistency"],["adaptability"],"r"],
  [146,"My typical working week is 35-50 hours.","My typical working week is in excess of 60 hours.",["achiever"],["achiever"],"r"],
  [147,"I am light-hearted.","I am serious.",["positivity"],["deliberative"],"r"],
  [148,"I want results now.","I am playing the long game.",["activator"],["strategic"],"r"],
  [149,"I can get along with anybody.","I select my friends carefully.",["includer"],["relator"],"r"],
  [150,"I cry easily.","I am tough-minded.",["empathy"],["command"],"r"],
  [151,"I am an observer of life.","I want to control the events of my life.",["intellection"],["command"],"r"],
  [152,"I can concentrate on my work for hours at a time.","An hour is about the max I can concentrate.",["achiever"],["focus"],"r"],
  [153,"I am a top achiever.","I consistently deliver positive results.",["competition"],["achiever"],"r"],
  [154,"I can outsmart other people.","Many people intimidate me.",["strategic"],["self_assurance"],"r"],
  [155,"I am at my best managing multiple workstreams at once.","I am at my best going deep on one thing at a time.",["arranger"],["focus"],"r"],
  [156,"I make it a point to try to be healthy.","I seek out new experiences.",["discipline"],["adaptability"],"r"],
  [157,"I am a good initiator.","I always follow through.",["activator"],["discipline"],"r"],
  [158,"I am the one who builds the team.","I am the one who comes up with the idea.",["developer"],["ideation"],"r"],
  [159,"I think in numbers and data.","I think in stories and images.",["analytical"],["communication"],"r"],
  [160,"I prefer intellectual discussions.","I prefer to talk about sports or entertainment.",["intellection"],["woo","significance"],"r"],
  [161,"The words I use are intellectually stimulating.","My vocabulary consists of practical words.",["intellection"],["learner"],"r"],
  [162,"My language consists of short, simple words.","I tend to use many abstract, complex words.",["communication"],["intellection"],"r"],
  [163,"It is easy for me to put my thoughts into words.","At times, I have trouble expressing my best ideas.",["communication"],["analytical"],"r"],
  [164,"I love to read.","I like to figure out how things work.",["learner"],["strategic"],"r"],
  [165,"My mind is always going.","I need to be physically active.",["activator"],["discipline"],"r"],
  [166,"I like lectures.","I like discussion groups.",["learner"],["woo","relator"],"r"],
  [167,"I like to study.","I get a thrill from discovering a pattern in data.",["intellection"],["analytical"],"r"],
  [168,"I have a craving to know more.","I have a craving to be rich.",["learner"],["significance"],"r"],
  [169,"I always make deadlines.","I follow through and do what I said I would do.",["discipline"],["responsibility"],"r"],
  [170,"A new idea makes my day.","Completing the tasks expected of me makes my day.",["ideation"],["achiever"],"r"],
  [171,"Whenever I am in a group, I seem to have more ideas than the others.","Whenever I am in a group, I seem to be the best prepared.",["ideation"],["learner","focus"],"r"],
  [172,"I never stop absorbing information.","I have a gift for simplifying complexities.",["intellection"],["strategic"],"r"],
  [173,"Winning is everything.","Doing it right is everything.",["competition"],["consistency","belief"],"r"],
  [174,"My philosophy guides my life.","My life is guided by me.",["belief"],["self_assurance"],"r"],
  [175,"I spend at least five hours alone thinking each week.","I like to be with people.",["intellection"],["relator"],"r"],
  [176,"I know my strengths better than my weaknesses.","I know my weaknesses better than my strengths.",["maximizer"],["restorative"],"r"],
  [177,"An interruption can be a worthwhile surprise.","My priorities are always clear.",["adaptability"],["discipline"],"r"],
  [178,"Understanding the past is vital to confidence in the future.","I focus on today.",["context"],["focus"],"r"],
  [179,"In life, there are no coincidences.","Not everything has special meaning.",["connectedness"],["analytical"],"r"],
  [180,"If I get a bonus, I would prefer $1,000 now.","If I get a bonus, I would prefer $100 per month for one year.",["focus","discipline"],["adaptability"],"r"],
  [181,"I like to figure out why I failed.","I enjoy my successes.",["analytical"],["positivity"],"r"],
  [182,"Meeting new people gives me energy.","I regularly spend time with close friends.",["woo"],["relator"],"r"],
  [183,"My life is like a book I keep writing exciting chapters for.","Sometimes I feel like life is moving too fast.",["futuristic"],["adaptability"],"r"],
  [184,"I have a clear set of guidelines that I live by.","The world is full of interesting things, and I want to try them all.",["consistency"],["learner"],"r"],
  [185,"I like to focus on what I do best.","It is important to be well-rounded.",["maximizer"],["individualization"],"r"],
  [186,"I like to repair things.","I find troubleshooting exhausting.",["restorative"],["strategic"],"r"],
  [187,"I am always thinking one step ahead.","My feelings guide my decisions.",["strategic"],["empathy"],"r"],
  [188,"When I make plans, I think about different possible outcomes.","It is hard to predict the future.",["strategic"],["analytical"],"r"],
  [189,"I tend to be cautious.","Calculated risks make life more exciting.",["deliberative"],["activator"],"r"],
  [190,"Living in the past is a waste of time.","Those who do not learn from history are doomed to repeat it.",["adaptability"],["context"],"r"],
  [191,"We should live our lives as examples for others.","The purpose of life is to be happy.",["connectedness"],["positivity"],"r"],
  [192,"I can keep track of everything in the midst of chaos.","I prefer not to multitask.",["arranger"],["focus"],"r"],
  [193,"I like managing dynamic situations with many variables.","I like it best when things are simple and straightforward.",["arranger"],["focus"],"r"],
  [194,"Making decisions too quickly is reckless.","I don't like to wait for things to happen.",["deliberative"],["activator"],"r"],
  [195,"I love routines.","I am spontaneous.",["discipline"],["adaptability"],"r"],
  [196,"Overcoming weaknesses is how I succeed.","Developing my talents is how I succeed.",["restorative"],["maximizer"],"r"],
  [197,"If I get a surprise bill, I would prefer to pay $1,000 now.","If I get a surprise bill, I would prefer to pay $100 per month for one year.",["focus"],["adaptability"],"r"],
  [198,"I do my best work under pressure.","I do my best work with time to prepare.",["activator"],["discipline"],"r"],
  [199,"I think people should be more logical.","It is very easy for me to understand a person's feelings.",["analytical"],["empathy"],"r"],
  [200,"I thrive at big events with lots of new faces.","I thrive in small groups with people I know well.",["woo"],["relator"],"r"],
];

/* Intensity check questions: both sides = same theme. Right side is HIGH except Q67 where Left is HIGH */
var INTENSITY_HIGH_RIGHT = [46, 54, 126, 143, 146];
var INTENSITY_HIGH_LEFT = [67];

/* ---- SCORING: Gallup-style +2/+1/0/+1/+2 accumulation ---- */
function calcScores(answers) {
  var bins = {};
  ALL_T.forEach(function(t) { bins[t] = 0; });

  answers.forEach(function(a) {
    var q = Q[a.qi];
    if (!q) return;
    var tA = q[3];
    var tB = q[4];
    var val = a.val;
    var qid = q[0];

    /* Check if intensity check (same theme both sides) */
    var isIntensity = tA.length === 1 && tB.length === 1 && tA[0] === tB[0];

    if (isIntensity) {
      var theme = tA[0];
      var highRight = INTENSITY_HIGH_RIGHT.indexOf(qid) >= 0;
      /* highRight: val 5 = +2, val 4 = +1, val 3 = 0, val 2 = -1, val 1 = -2 */
      /* highLeft:  val 1 = +2, val 2 = +1, val 3 = 0, val 4 = -1, val 5 = -2 */
      if (highRight) {
        if (val === 5) bins[theme] += 2;
        else if (val === 4) bins[theme] += 1;
        else if (val === 2) bins[theme] -= 1;
        else if (val === 1) bins[theme] -= 2;
      } else {
        if (val === 1) bins[theme] += 2;
        else if (val === 2) bins[theme] += 1;
        else if (val === 4) bins[theme] -= 1;
        else if (val === 5) bins[theme] -= 2;
      }
    } else {
      /* Normal question: winning side gets points, split among themes if multiple */
      var pointsA = 0;
      var pointsB = 0;
      if (val === 1) pointsA = 2;
      else if (val === 2) pointsA = 1;
      else if (val === 4) pointsB = 1;
      else if (val === 5) pointsB = 2;

      if (pointsA > 0) {
        var splitA = pointsA / tA.length;
        tA.forEach(function(t) { bins[t] += splitA; });
      }
      if (pointsB > 0) {
        var splitB = pointsB / tB.length;
        tB.forEach(function(t) { bins[t] += splitB; });
      }
    }
  });

  /* Rank by raw score */
  return ALL_T.map(function(id) {
    return { id: id, score: Math.round(bins[id] * 10) / 10, n: 0 };
  }).sort(function(a, b) { return b.score - a.score; });
}

/* ---- ADAPTIVE ---- */
function getNextBatch(answers, ranked) {
  var fuzzy = [];
  for (var i = 0; i < ranked.length - 1; i++) {
    var gap = ranked[i].score - ranked[i + 1].score;
    var near = (i >= 3 && i <= 6) || (i >= 8 && i <= 11);
    if (gap < (near ? 2 : 1)) { fuzzy.push(ranked[i].id); fuzzy.push(ranked[i + 1].id); }
  }
  var fuzzySet = new Set(fuzzy);
  if (fuzzySet.size === 0) return [];
  var used = new Set(answers.map(function(a) { return a.qi; }));
  var candidates = [];
  Q.forEach(function(q, i) {
    if (q[5] !== "r" || used.has(i)) return;
    var all = q[3].concat(q[4]);
    var hits = all.filter(function(t) { return fuzzySet.has(t); }).length;
    if (hits > 0) candidates.push({ i: i, hits: hits });
  });
  candidates.sort(function(a, b) { return b.hits - a.hits; });
  return candidates.slice(0, 10).map(function(x) { return x.i; });
}

/* ---- STORAGE ---- */
var SKEY_PREFIX = "arc-quiz-g1-";
function getKey(email) { return SKEY_PREFIX + email.toLowerCase().trim(); }
function saveData(email, d) { try { localStorage.setItem(getKey(email), JSON.stringify(d)); } catch(e) { /* */ } }
function loadData(email) { try { var r = localStorage.getItem(getKey(email)); return r ? JSON.parse(r) : null; } catch(e) { return null; } }
function clearData(email) { try { localStorage.removeItem(getKey(email)); } catch(e) { /* */ } }

/* ---- SUPABASE LOOKUP ---- */
async function checkSupabaseExists(email) {
  if (!supabase) return null;
  try {
    var { data, error } = await supabase
      .from("quiz_results")
      .select("name, created_at")
      .eq("email", email.toLowerCase().trim())
      .order("created_at", { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return { name: data[0].name, hasResults: true };
  } catch (e) { return null; }
}

async function verifyPinAndGetResults(email, pin) {
  if (!supabase) return null;
  try {
    var { data, error } = await supabase
      .from("quiz_results")
      .select("name, top_5, rankings, domain_scores, created_at, pin")
      .eq("email", email.toLowerCase().trim())
      .order("created_at", { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) return { error: "No results found" };
    var row = data[0];
    if (row.pin !== pin) return { error: "Incorrect PIN" };
    var ranked = row.rankings.map(function(r) {
      return { id: r.id, score: r.score };
    });
    return { name: row.name, ranked: ranked, fromDatabase: true, created_at: row.created_at };
  } catch (e) { return { error: "Lookup failed" }; }
}

function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/* ---- SUPABASE SUBMISSION ---- */
async function submitToSupabase(email, name, ranked) {
  if (!supabase) return null;
  try {
    var pin = generatePin();
    var top5 = ranked.slice(0, 5).map(function(t) { return t.id; });
    var domainScores = {};
    DO.forEach(function(d) {
      var themes = ranked.filter(function(t) { return TH[t.id].d === d; });
      domainScores[d] = {
        name: DOMAINS[d].name,
        avg: Math.round(themes.reduce(function(s, t) { return s + t.score; }, 0) / themes.length),
      };
    });
    await supabase.from("quiz_results").insert({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      top_5: top5,
      rankings: ranked.map(function(t) { return { id: t.id, score: t.score }; }),
      domain_scores: domainScores,
      pin: pin,
    });
    return pin;
  } catch (e) { console.error("Failed to submit results:", e); return null; }
}

/* ---- SHUFFLE ---- */
function shuffle(arr) {
  var a = arr.slice();
  var s = 42;
  for (var i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    var j = Math.floor(((s - 1) / 2147483646) * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

/* ---- PERSON ICON ---- */
function PersonIcon(props) {
  return (
    <svg width={props.size || 10} height={props.size ? props.size * 1.8 : 18} viewBox="0 0 10 18" fill={props.color || "#fff"}>
      <circle cx="5" cy="3" r="2.5" />
      <path d="M2 7.5 C2 6.5 3 6 5 6 C7 6 8 6.5 8 7.5 L8 13 C8 13.5 7.5 14 7 14 L7 17 C7 17.5 6.5 18 6 18 L4 18 C3.5 18 3 17.5 3 17 L3 14 C2.5 14 2 13.5 2 13 Z" />
    </svg>
  );
}

/* ---- DOMAIN PATTERN SVGs ---- */
function DomainPattern(props) {
  var d = props.domain;
  if (d === "influencing") {
    return (<svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0.1}} viewBox="0 0 400 900">
      {[60,140,220,300,380,460,540,620,700,780].map(function(y,i){return <line key={i} x1={i%2===0?-20:420} y1={y-30} x2={i%2===0?420:-20} y2={y+30} stroke="#fff" strokeWidth="1.5" opacity="0.2"/>;})}
    </svg>);
  } else if (d === "strategic_thinking") {
    return (<svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0.12}} viewBox="0 0 400 900">
      <circle cx="80" cy="150" r="3" fill="#fff"/><circle cx="220" cy="100" r="2" fill="#fff"/>
      <circle cx="330" cy="200" r="4" fill="#fff"/><circle cx="120" cy="350" r="2.5" fill="#fff"/>
      <circle cx="290" cy="320" r="3" fill="#fff"/><circle cx="200" cy="480" r="3.5" fill="#fff"/>
      <circle cx="60" cy="580" r="3" fill="#fff"/><circle cx="320" cy="620" r="2" fill="#fff"/>
      <line x1="80" y1="150" x2="220" y2="100" stroke="#fff" strokeWidth="0.5" opacity="0.3"/>
      <line x1="220" y1="100" x2="330" y2="200" stroke="#fff" strokeWidth="0.5" opacity="0.25"/>
      <line x1="120" y1="350" x2="200" y2="480" stroke="#fff" strokeWidth="0.5" opacity="0.3"/>
      <line x1="290" y1="320" x2="330" y2="200" stroke="#fff" strokeWidth="0.5" opacity="0.2"/>
    </svg>);
  } else if (d === "relationship_building") {
    return (<svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0.08}} viewBox="0 0 400 900">
      <path d="M-50 150 Q100 100 200 150 Q300 200 450 150" stroke="#fff" strokeWidth="1.5" fill="none"/>
      <path d="M-50 350 Q100 300 200 350 Q300 400 450 350" stroke="#fff" strokeWidth="1.5" fill="none"/>
      <path d="M-50 550 Q100 500 200 550 Q300 600 450 550" stroke="#fff" strokeWidth="1.5" fill="none"/>
      <path d="M-50 750 Q100 700 200 750 Q300 800 450 750" stroke="#fff" strokeWidth="1.5" fill="none"/>
    </svg>);
  } else {
    return (<svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0.08}} viewBox="0 0 400 900">
      <path d="M50 100 L200 250 L350 400 L200 550 L50 700" stroke="#fff" strokeWidth="1" fill="none" opacity="0.3"/>
      <path d="M350 100 L200 250 L50 400 L200 550 L350 700" stroke="#fff" strokeWidth="1" fill="none" opacity="0.2" strokeDasharray="8 6"/>
    </svg>);
  }
}

/* ---- REVEAL SCREEN (Wrapped-style) ---- */
function RevealScreen(props) {
  const [slide, setSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [expanded, setExpanded] = useState(null);
  var ranked = props.ranked;
  var name = props.name || "You";
  var firstName = name.split(" ")[0];
  var top5 = ranked.slice(0, 5);
  var totalQ = props.totalQ || 90;
  var totalSlides = 7;

  var byD = {};
  DO.forEach(function(d) { byD[d] = ranked.filter(function(t) { return TH[t.id].d === d; }).sort(function(a,b) { return b.score - a.score; }); });
  var da = DO.map(function(d) {
    var avg = Math.round(byD[d].reduce(function(s,t){return s+t.score;},0)/byD[d].length);
    return {id:d,name:DOMAINS[d].name,color:DOMAINS[d].color,avg:avg};
  }).sort(function(a,b){return b.avg-a.avg;});

  function next() {
    if (slide >= totalSlides - 1) return;
    setFadeIn(false);
    setTimeout(function() { setSlide(slide + 1); setFadeIn(true); if (slide + 1 === 4) setExpanded(top5[0].id); }, 250);
  }

  function getColor(id) { return DOMAINS[TH[id].d].color; }
  function getBg(id) { return DOMAIN_GRADIENTS[TH[id].d]; }
  function getRarity(pct) { return pct <= 8 ? "Rare" : pct <= 15 ? "Uncommon" : "Common"; }
  function getRarityColor(r) { return r === "Rare" ? "#fca5a5" : r === "Uncommon" ? "#c4b5fd" : "rgba(255,255,255,0.5)"; }

  /* Shared styles */
  var grainStyle = {position:"absolute",inset:0,backgroundImage:GRAIN,backgroundRepeat:"repeat",backgroundSize:256,opacity:0.5,pointerEvents:"none"};

  return (
    <div style={{minHeight:"100vh",fontFamily:"'DM Sans', system-ui, sans-serif",color:"#fff"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

      <div style={{opacity:fadeIn?1:0,transform:fadeIn?"none":"scale(0.97)",transition:"opacity 0.3s ease, transform 0.3s ease"}} onClick={slide !== 4 && slide < totalSlides - 1 ? next : undefined}>

      {/* 0: INTRO */}
      {slide === 0 && (
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 0 80px",position:"relative",overflow:"hidden",background:"linear-gradient(160deg, #0a0a1a 0%, #1a0a2e 40%, #2d1054 70%, #0a0a1a 100%)"}}>
          <div style={{position:"absolute",top:"15%",right:"-10%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle, rgba(109,40,217,0.25) 0%, transparent 70%)",filter:"blur(60px)"}}/>
          <div style={{position:"absolute",bottom:"20%",left:"-5%",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)",filter:"blur(40px)"}}/>
          <div style={grainStyle}/>
          <div style={{position:"relative",padding:"0 32px"}}>
            <div style={{fontSize:11,letterSpacing:5,textTransform:"uppercase",color:"rgba(255,255,255,0.3)",marginBottom:16,fontWeight:600}}>Strengths Discovery</div>
            <h1 style={{fontFamily:"'DM Sans', system-ui, sans-serif",fontSize:52,fontWeight:800,color:"#fff",lineHeight:1.0,margin:"0 0 20px",maxWidth:300}}>Your<br/>Strengths<br/>Revealed.</h1>
            <p style={{fontSize:16,color:"rgba(255,255,255,0.4)",lineHeight:1.6,maxWidth:260}}>You answered {totalQ} questions. Here's what makes you powerful.</p>
          </div>
          <div style={{position:"absolute",bottom:32,left:32,right:32}}>
            <div style={{display:"flex",gap:4}}>
              {Array.from({length:totalSlides}).map(function(_,i){return <div key={i} style={{flex:i===0?3:1,height:3,borderRadius:2,background:i===0?"#6D28D9":"rgba(255,255,255,0.1)"}}/>;}) }
            </div>
            <div style={{marginTop:12,fontSize:12,color:"rgba(255,255,255,0.3)"}}>Tap anywhere to continue</div>
          </div>
        </div>
      )}

      {/* 1: DOMAINS */}
      {slide === 1 && (
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",position:"relative",overflow:"hidden",background:"linear-gradient(160deg, #0a0a1a 0%, #1a1030 50%, #0a0a1a 100%)"}}>
          <div style={grainStyle}/>
          <div style={{position:"relative",padding:"0 28px"}}>
            <div style={{fontSize:11,letterSpacing:5,textTransform:"uppercase",color:"rgba(255,255,255,0.3)",fontWeight:600,marginBottom:32}}>Your Strengths Cluster In</div>
            <div style={{padding:"28px 24px",borderRadius:16,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",marginBottom:16}}>
              <div style={{fontFamily:"'DM Sans', system-ui, sans-serif",fontSize:34,fontWeight:800,color:da[0].color,marginBottom:4}}>{da[0].name}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>Your dominant domain</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              {da.slice(1).map(function(d){return <div key={d.id} style={{flex:1,padding:"12px 8px",borderRadius:10,background:"rgba(255,255,255,0.04)",textAlign:"center"}}><div style={{fontSize:13,fontWeight:600,color:d.color}}>{d.name.split(" ")[0]}</div></div>;})}
            </div>
          </div>
        </div>
      )}

      {/* 2: COMBINED #5 #4 #3 #2 */}
      {slide === 2 && (
        <div style={{minHeight:"100vh",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"center",background:"linear-gradient(160deg, #0a0a1a 0%, #141428 50%, #0a0a1a 100%)"}}>
          <div style={grainStyle}/>
          <div style={{position:"relative",padding:"0 24px"}}>
            <div style={{fontSize:11,letterSpacing:5,textTransform:"uppercase",color:"rgba(255,255,255,0.25)",fontWeight:600,marginBottom:28}}>Your Top 5</div>
            {[top5[4],top5[3],top5[2],top5[1]].map(function(t,i){
              var rank=[5,4,3,2][i]; var rd=REVEAL_DATA[t.id]||{}; var dc=getColor(t.id); var th=TH[t.id]; var rarity=getRarity(rd.pct||10);
              return(
                <div key={rank} style={{display:"flex",gap:14,marginBottom:16,padding:"16px 16px",borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,width:40}}>
                    <div style={{fontFamily:"'DM Sans', system-ui, sans-serif",fontSize:24,fontWeight:800,color:dc,lineHeight:1}}>#{rank}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'DM Sans', system-ui, sans-serif",fontSize:22,fontWeight:800,color:"#fff",marginBottom:2}}>{th.n}</div>
                    <div style={{fontSize:11,color:dc,marginBottom:6,fontWeight:500}}>{DOMAINS[th.d].name}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.5}}>{th.desc}</div>
                    <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}><b style={{color:"#fff"}}>{rd.pct||"?"}%</b> share this</span>
                      <span style={{fontSize:9,color:getRarityColor(rarity),padding:"2px 8px",borderRadius:10,background:"rgba(255,255,255,0.06)"}}>{rarity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{textAlign:"center",marginTop:8}}><div style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>But your #1 strength is...</div></div>
          </div>
        </div>
      )}

      {/* 3: #1 REVEAL */}
      {slide === 3 && (function(){
        var t=top5[0]; var th=TH[t.id]; var rd=REVEAL_DATA[t.id]||{}; var dc=getColor(t.id); var rarity=getRarity(rd.pct||10);
        return(
          <div style={{minHeight:"100vh",position:"relative",overflow:"hidden",background:getBg(t.id)}}>
            <DomainPattern domain={th.d}/>
            <div style={{position:"absolute",top:"30%",left:"40%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle, "+dc+"44 0%, transparent 60%)",filter:"blur(80px)"}}/>
            <div style={grainStyle}/>
            <div style={{position:"relative",minHeight:"100vh",display:"flex"}}>
              <div style={{flex:1,display:"flex",flexDirection:"column",padding:"28px 16px 24px 24px"}}>
                <div style={{fontSize:11,letterSpacing:5,textTransform:"uppercase",color:"rgba(255,255,255,0.4)",fontWeight:600}}>Your #1 Strength</div>
                <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
                  <div style={{fontSize:40,marginBottom:8}}>{"\u2B50"}</div>
                  <h1 style={{fontFamily:"'DM Sans', system-ui, sans-serif",fontSize:50,fontWeight:800,color:"#fff",lineHeight:0.95,margin:"0 0 6px",letterSpacing:-1}}>{th.n}.</h1>
                  <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.4)",marginBottom:16,letterSpacing:2,textTransform:"uppercase"}}>{DOMAINS[th.d].name}</div>
                  <p style={{fontSize:14,color:"rgba(255,255,255,0.65)",lineHeight:1.6,maxWidth:250,margin:0}}>{th.desc}</p>
                </div>
                <div style={{padding:"14px 14px",borderRadius:14,background:"rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,0.25)",marginBottom:4}}>In Good Company</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:10,lineHeight:1.4}}>Also said to have this strength in their top 5.</div>
                  <div style={{display:"flex",gap:6}}>
                    <div style={{flex:1,padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,0.06)"}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{rd.fic||""}</div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>Fictional</div>
                    </div>
                    <div style={{flex:1,padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,0.06)"}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{rd.real||""}</div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>Real World</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{width:52,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 6px",borderLeft:"1px solid rgba(255,255,255,0.06)"}}>
                <div style={{display:"flex",flexDirection:"column",flexWrap:"wrap",alignContent:"center",gap:1,flex:1,maxHeight:480}}>
                  {Array.from({length:100}).map(function(_,i){return <PersonIcon key={i} size={5} color={i<(rd.pct||10)?"#fff":"rgba(255,255,255,0.08)"}/>;}) }
                </div>
                <div style={{writingMode:"vertical-rl",fontSize:8,color:"rgba(255,255,255,0.35)",fontWeight:600,letterSpacing:1,marginTop:6}}>{rd.pct||"?"}% SHARE THIS</div>
                <div style={{marginTop:4,padding:"3px 8px",borderRadius:10,background:rarity==="Rare"?"rgba(220,38,38,0.3)":"rgba(109,40,217,0.25)"}}>
                  <span style={{fontSize:8,fontWeight:600,color:getRarityColor(rarity)}}>{rarity}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4: WHAT YOUR TOP 5 MEANS */}
      {slide === 4 && (
        <div style={{minHeight:"100vh",position:"relative",overflow:"hidden",background:"linear-gradient(160deg, #0a0a1a 0%, #141020 50%, #0a0a1a 100%)"}}>
          <div style={grainStyle}/>
          <div style={{position:"relative",padding:"28px 20px 40px"}} onClick={function(e){e.stopPropagation();}}>
            <div style={{fontSize:11,letterSpacing:5,textTransform:"uppercase",color:"rgba(255,255,255,0.3)",fontWeight:600,marginBottom:6}}>Dig Deeper</div>
            <div style={{fontFamily:"'DM Sans', system-ui, sans-serif",fontSize:24,fontWeight:800,color:"#fff",marginBottom:20}}>What Your Top 5 Means</div>
            {top5.map(function(t,i){
              var th=TH[t.id]; var dc=getColor(t.id); var isOpen=expanded===t.id;
              return(
                <div key={t.id} style={{marginBottom:8,borderRadius:14,overflow:"hidden",border:"1px solid "+(isOpen?dc+"44":"rgba(255,255,255,0.06)"),background:isOpen?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.02)",transition:"all 0.2s ease"}}>
                  <div onClick={function(){setExpanded(isOpen?null:t.id);}} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer"}}>
                    <div style={{fontFamily:"'DM Sans', system-ui, sans-serif",fontSize:16,fontWeight:800,color:dc,flexShrink:0}}>#{i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'DM Sans', system-ui, sans-serif",fontSize:18,fontWeight:700,color:"#fff"}}>{th.n}</div>
                      <div style={{fontSize:10,color:dc,fontWeight:500}}>{DOMAINS[th.d].name}</div>
                    </div>
                    <div style={{fontSize:18,color:"rgba(255,255,255,0.3)"}}>{isOpen?"\u2212":"+"}</div>
                  </div>
                  {isOpen && th.atWork && (
                    <div style={{padding:"0 16px 16px"}}>
                      {props.insights && props.insights.themes && props.insights.themes[t.id] && (
                        <div style={{marginBottom:12,padding:"12px 14px",borderRadius:10,background:"rgba(109,40,217,0.1)",border:"1px solid rgba(109,40,217,0.15)"}}>
                          <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#c4b5fd",fontWeight:600,marginBottom:6}}>WHY YOUR {th.n.toUpperCase()} IS UNIQUE</div>
                          <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",lineHeight:1.65}}>{props.insights.themes[t.id].unique}</div>
                        </div>
                      )}
                      {[{label:"AT WORK",text:th.atWork},{label:"AT YOUR BEST",text:th.atBest},{label:"HOW TO LEAN IN",text:th.leanIn}].map(function(sec){
                        return(<div key={sec.label} style={{marginBottom:12,padding:"12px 14px",borderRadius:10,background:"rgba(0,0,0,0.2)"}}>
                          <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:dc,fontWeight:600,marginBottom:6}}>{sec.label}</div>
                          <div style={{fontSize:12,color:"rgba(255,255,255,0.55)",lineHeight:1.65}}>{sec.text}</div>
                        </div>);
                      })}
                      {props.insights && props.insights.themes && props.insights.themes[t.id] && props.insights.themes[t.id].blindSpots && (
                        <div style={{marginBottom:0,padding:"12px 14px",borderRadius:10,background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.12)"}}>
                          <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#fca5a5",fontWeight:600,marginBottom:6}}>WATCH OUT</div>
                          <div style={{fontSize:12,color:"rgba(255,255,255,0.55)",lineHeight:1.65}}>{props.insights.themes[t.id].blindSpots}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{textAlign:"center",marginTop:16}}>
              <button onClick={function(){next();}} style={{padding:"12px 32px",borderRadius:10,border:"none",cursor:"pointer",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:14,fontWeight:600}}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* 5: EQUATION */}
      {slide === 5 && (
        <div style={{minHeight:"100vh",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"center",background:"linear-gradient(160deg, #0a0a1a 0%, #12082a 50%, #0a0a1a 100%)"}}>
          <div style={grainStyle}/>
          <div style={{position:"absolute",top:"40%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 60%)",filter:"blur(80px)"}}/>
          <div style={{position:"relative",padding:"0 28px"}}>
            <div style={{fontSize:11,letterSpacing:5,textTransform:"uppercase",color:"rgba(255,255,255,0.25)",fontWeight:600,marginBottom:28}}>How Your Strengths Combine</div>
            <div style={{marginBottom:36}}>
              {top5.map(function(t,i){ var dc=getColor(t.id);
                return(<div key={i} style={{display:"flex",alignItems:"baseline",marginBottom:2}}>
                  <div style={{width:4,height:28,borderRadius:2,background:dc,marginRight:14,flexShrink:0,alignSelf:"center"}}/>
                  <span style={{fontFamily:"'DM Sans', system-ui, sans-serif",fontSize:32,fontWeight:800,color:"#fff",lineHeight:1.3}}>{TH[t.id].n}</span>
                  {i<4&&<span style={{fontFamily:"'DM Sans', system-ui, sans-serif",fontSize:20,fontWeight:300,color:"rgba(255,255,255,0.15)",marginLeft:10}}>{"\u00D7"}</span>}
                </div>);
              })}
            </div>
            <div style={{display:"flex",height:4,borderRadius:2,overflow:"hidden",marginBottom:24,maxWidth:260}}>
              {top5.map(function(t,i){return <div key={i} style={{flex:1,background:getColor(t.id)}}/>;}) }
            </div>
            <p style={{fontFamily:"'DM Sans', system-ui, sans-serif",fontSize:19,fontStyle:"italic",color:"rgba(255,255,255,0.55)",lineHeight:1.6,maxWidth:300,margin:0}}>
              {props.insights && props.insights.summary ? props.insights.summary : firstName + ", you " + top5.map(function(t,i){var v=["lead with your top talent","see the path forward","adapt when things shift","push for the win","bring fresh ideas"];return(i<4?v[i]+", ":v[i]+"."); }).join("")}
            </p>
          </div>
        </div>
      )}

      {/* 6: CTA + SHARE */}
      {slide === 6 && (
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",background:"#0a0a0f",padding:"30px 20px"}} onClick={function(e){e.stopPropagation();}}>
          <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle, rgba(109,40,217,0.15) 0%, transparent 60%)",filter:"blur(80px)"}}/>
          <div style={{fontFamily:"'DM Sans', system-ui, sans-serif",fontSize:32,fontWeight:800,color:"#fff",textAlign:"center",lineHeight:1.2,marginBottom:16}}>Ready to<br/>dig deeper?</div>
          <p style={{fontSize:15,color:"rgba(255,255,255,0.45)",textAlign:"center",lineHeight:1.6,maxWidth:300,marginBottom:32}}>See the full breakdown of all 34 strengths, learn how your top 5 show up at work, and discover how to lean into them.</p>
          <button onClick={function(){props.onFinish();}} style={{padding:"16px 48px",borderRadius:12,border:"none",cursor:"pointer",background:"#6D28D9",color:"#fff",fontSize:16,fontWeight:700,boxShadow:"0 4px 20px rgba(109,40,217,0.3)"}}>See Full Results</button>
          <div style={{marginTop:24,fontSize:11,color:"rgba(255,255,255,0.2)"}}>Your results are saved. Come back anytime with your email.</div>
        </div>
      )}

      </div>
    </div>
  );
}

/* ---- PRACTICE QUESTION ---- */
function PracticeQuestion(props) {
  const [picked, setPicked] = useState(false);
  const [selectedVal, setSelectedVal] = useState(null);
  var pickedLeft = selectedVal && selectedVal <= 2;
  var pickedRight = selectedVal && selectedVal >= 4;
  var pickedNeutral = selectedVal === 3;

  function handlePick(v) {
    if (picked) return;
    setSelectedVal(v);
    setPicked(true);
    if (v <= 2) {
      if (props.onComplete) props.onComplete();
    }
  }

  function handleReset() {
    setPicked(false);
    setSelectedVal(null);
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 8px" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, padding: "0 2px" }}>
          <div style={{ fontSize: 11, color: "#1a1a2e", fontWeight: 600 }}>Strongly Describes Me</div>
          <div style={{ fontSize: 11, color: "#1a1a2e", fontWeight: 600 }}>Neutral</div>
          <div style={{ fontSize: 11, color: "#1a1a2e", fontWeight: 600 }}>Strongly Describes Me</div>
        </div>
        <div style={{ display: "flex", border: "2px solid #ccc", borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
          {[1, 2, 3, 4, 5].map(function(v) {
            var isSelected = selectedVal === v;
            var defaultBg = v === 1 || v === 5 ? "#c8c8c8" : v === 2 || v === 4 ? "#ddd" : "#f0f0f0";
            return (
              <button
                key={v}
                onClick={function() { handlePick(v); }}
                style={{
                  flex: 1, padding: "14px 0", cursor: picked ? "default" : "pointer",
                  border: "none",
                  borderRight: v < 5 ? "1px solid #ccc" : "none",
                  background: isSelected ? "#6D28D9" : defaultBg,
                  minHeight: 44,
                  transition: "background 0.15s ease",
                }}
              >{"\u00A0"}</button>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1, fontSize: 14, lineHeight: 1.4, fontWeight: 700, color: pickedLeft ? "#6D28D9" : "#1a1a2e", transition: "color 0.15s" }}>I understand how this works.</div>
          <div style={{ flex: 1, fontSize: 14, lineHeight: 1.4, fontWeight: 700, color: pickedRight ? "#6D28D9" : "#1a1a2e", textAlign: "right", transition: "color 0.15s" }}>I didn't read the instructions.</div>
        </div>
      </div>
      {pickedLeft && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <p style={{ fontSize: 13, color: "#059669", fontWeight: 600, margin: 0 }}>You're all set. Remember, once you make a selection you can't go back, so trust your gut and choose right the first time.</p>
        </div>
      )}
      {(pickedRight || pickedNeutral) && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <p style={{ fontSize: 13, color: "#DC2626", fontWeight: 600, margin: "0 0 8px" }}>No worries. Scroll up and read through the instructions, then come back and try again.</p>
          <button onClick={handleReset} style={{ fontSize: 12, color: "#6D28D9", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Try again</button>
        </div>
      )}
    </div>
  );
}

/* ---- THEME NAME TO ID MAP ---- */
var THEME_NAME_MAP = {};
ALL_T.forEach(function(id) { THEME_NAME_MAP[TH[id].n.toLowerCase().replace("-","")] = id; });
THEME_NAME_MAP["self assurance"] = "self_assurance";
THEME_NAME_MAP["selfassurance"] = "self_assurance";

function parseGallupText(text) {
  var lines = text.split(/\n/);
  var found = [];
  var seen = {};
  lines.forEach(function(line) {
    var m = line.match(/^\s*(\d{1,2})[\.\)\s]+([A-Za-z\- ]+)/);
    if (m) {
      var num = parseInt(m[1]);
      var raw = m[2].trim().replace(/[®™]/g, "").trim().toLowerCase().replace(/[\s-]+/g, " ").replace("self assurance","self_assurance");
      var key = raw.replace(/\s+/g, "").replace("-","");
      var id = THEME_NAME_MAP[key] || THEME_NAME_MAP[raw] || null;
      if (!id) {
        ALL_T.forEach(function(tid) {
          if (TH[tid].n.toLowerCase().replace("-","").replace(" ","") === key) id = tid;
        });
      }
      if (id && !seen[id] && num >= 1 && num <= 34) {
        found.push({ rank: num, id: id });
        seen[id] = true;
      }
    }
  });
  found.sort(function(a, b) { return a.rank - b.rank; });
  if (found.length < 5) return null;
  return found.map(function(f, i) { return { id: f.id, score: Math.round(40 - i * 1.2), n: 0 }; });
}

/* ---- WELCOME ---- */
function Welcome(props) {
  const [practiced, setPracticed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [foundSaved, setFoundSaved] = useState(null);
  const [importMode, setImportMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [importError, setImportError] = useState("");
  var canBegin = practiced && name.trim().length > 0 && email.trim().includes("@");

  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [dbRecord, setDbRecord] = useState(null);

  function checkEmail() {
    if (!email.trim().includes("@")) return;
    setChecking(true);
    setPinError("");
    setDbRecord(null);
    var s = loadData(email);
    if (s && s.answers && s.answers.length > 0) {
      setFoundSaved(s);
      if (s.name) setName(s.name);
      setChecking(false);
    } else {
      // Nothing in localStorage — check Supabase for completed results
      checkSupabaseExists(email).then(function(result) {
        if (result && result.hasResults) {
          setDbRecord(result);
          if (result.name) setName(result.name);
        } else { setDbRecord(null); }
        setFoundSaved(null);
        setChecking(false);
      }).catch(function() { setFoundSaved(null); setDbRecord(null); setChecking(false); });
    }
  }

  function handlePinSubmit() {
    if (pinInput.length !== 4) { setPinError("PIN must be 4 digits"); return; }
    setPinError("");
    setChecking(true);
    verifyPinAndGetResults(email, pinInput).then(function(result) {
      if (result && result.error) {
        setPinError(result.error);
        setChecking(false);
      } else if (result && result.ranked) {
        setFoundSaved({ answers: [], ranked: result.ranked, completed: true, name: result.name, fromDatabase: true });
        setChecking(false);
      } else {
        setPinError("Something went wrong");
        setChecking(false);
      }
    });
  }

  function handleImport() {
    var ranked = parseGallupText(pasteText);
    if (!ranked || ranked.length < 5) {
      setImportError("Could not find enough themes. Make sure you pasted the numbered list (1. Ideation, 2. Activator, etc.)");
      return;
    }
    setImportError("");
    props.onImport(ranked, name || "Friend", email);
  }

  var inputStyle = { padding: "12px 16px", borderRadius: 8, border: "1px solid #e8e6f0", fontSize: 15, width: "100%", maxWidth: 320, textAlign: "center", fontFamily: "'DM Sans', system-ui, sans-serif", outline: "none", boxSizing: "border-box", background: "#fff", color: "#1a1a2e" };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 24px", textAlign: "center", background: "#fff", minHeight: "100vh" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#6D28D9", marginBottom: 14, fontWeight: 600 }}>Strengths Discovery</div>
      <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, margin: "0 0 18px", color: "#1a1a2e" }}>Strengths Discovery</h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#555570", margin: "0 auto 24px", maxWidth: 440 }}>
        This assessment identifies your natural strengths across 34 themes. Most people finish in 15 to 20 minutes.
      </p>
      <div style={{ textAlign: "left", maxWidth: 420, margin: "0 auto 16px", padding: "14px 18px", background: "#fff4e5", borderRadius: 10, border: "1px solid #fde68a" }}>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: "#92400e", margin: 0 }}>For best results, plan to take this in one sitting. Your progress saves automatically, but setting aside 15 to 20 uninterrupted minutes will give you the most accurate results.</p>
      </div>
      <div style={{ textAlign: "left", maxWidth: 420, margin: "0 auto 28px", padding: "20px 24px", background: "#f8f7fc", borderRadius: 10, border: "1px solid #e8e6f0" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", margin: "0 0 12px" }}>How it works:</p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#555570", margin: "0 0 10px" }}>You will see two statements side by side. Pick the one you identify with more.</p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#555570", margin: "0 0 10px" }}>They are not always opposites. You may relate to both, and that is fine. The question is which one feels more like you.</p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#555570", margin: "0 0 10px" }}>If neither one fits, pick the middle. But try to lean one way when you can, because that gives us a better picture of your strengths.</p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#555570", margin: 0 }}>There are no right or wrong answers. Trust your gut.</p>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: "#9999aa", margin: "0 auto 24px", maxWidth: 400 }}>
        When you make a selection, it will automatically move to the next question. You cannot go back, so trust your first instinct. Try it below:
      </p>
      <PracticeQuestion onComplete={function() { setPracticed(true); }} />
      {practiced && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <input type="text" placeholder="Your name" value={name} onChange={function(e) { setName(e.target.value); }} style={inputStyle} />
            <input type="email" placeholder="Your email" value={email} onChange={function(e) { setEmail(e.target.value); setFoundSaved(null); }} onBlur={checkEmail} style={inputStyle} />
          </div>
          {checking && <p style={{ fontSize: 12, color: "#9999aa" }}>Checking...</p>}
          {dbRecord && !foundSaved && !checking && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#059669", fontWeight: 600, margin: "0 0 10px" }}>Welcome back{dbRecord.name ? ", " + dbRecord.name : ""}! Enter your 4-digit PIN to view your results.</p>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <input type="text" inputMode="numeric" maxLength={4} placeholder="4-digit PIN" value={pinInput} onChange={function(e) { setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4)); setPinError(""); }} style={{ ...inputStyle, maxWidth: 160, letterSpacing: 8, fontSize: 20, textAlign: "center" }} />
                {pinError && <p style={{ fontSize: 12, color: "#DC2626", margin: "0" }}>{pinError}</p>}
                <button onClick={handlePinSubmit} disabled={pinInput.length !== 4} style={{ padding: "12px 36px", borderRadius: 8, border: "none", cursor: pinInput.length === 4 ? "pointer" : "default", background: pinInput.length === 4 ? "#6D28D9" : "#ccc", color: "#fff", fontSize: 15, fontWeight: 600 }}>Verify PIN</button>
                <button onClick={function() { setDbRecord(null); props.onStart(false, email, name); }} style={{ padding: "10px 30px", borderRadius: 8, border: "1px solid #e8e6f0", cursor: "pointer", background: "transparent", color: "#555570", fontSize: 14 }}>Start Fresh Instead</button>
              </div>
            </div>
          )}
          {foundSaved && (
            <div style={{ marginBottom: 16 }}>
              {foundSaved.fromDatabase ? (
                <p style={{ fontSize: 13, color: "#059669", fontWeight: 600, margin: "0 0 10px" }}>PIN verified! Ready to view your results.</p>
              ) : (
                <p style={{ fontSize: 13, color: "#059669", fontWeight: 600, margin: "0 0 10px" }}>Welcome back{foundSaved.name ? ", " + foundSaved.name : ""}! You have {foundSaved.answers.length} answers saved.</p>
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                {foundSaved.fromDatabase && foundSaved.completed ? (
                  <button onClick={function() { props.onTestResults(foundSaved.ranked, foundSaved.name || name); }} style={{ padding: "14px 44px", borderRadius: 8, border: "none", cursor: "pointer", background: "#6D28D9", color: "#fff", fontSize: 16, fontWeight: 600 }}>View My Results</button>
                ) : (
                  <button onClick={function() { props.onStart(true, email, foundSaved.name || name); }} style={{ padding: "14px 44px", borderRadius: 8, border: "none", cursor: "pointer", background: "#6D28D9", color: "#fff", fontSize: 16, fontWeight: 600 }}>Resume</button>
                )}
                <button onClick={function() { setFoundSaved(null); setDbRecord(null); props.onStart(false, email, name); }} style={{ padding: "10px 30px", borderRadius: 8, border: "1px solid #e8e6f0", cursor: "pointer", background: "transparent", color: "#555570", fontSize: 14 }}>Start Fresh</button>
              </div>
            </div>
          )}
          {!foundSaved && !checking && canBegin && (
            <button onClick={function() { props.onStart(false, email, name); }} style={{ padding: "14px 44px", borderRadius: 8, border: "none", cursor: "pointer", background: "#6D28D9", color: "#fff", fontSize: 16, fontWeight: 600 }}>Begin</button>
          )}
          <div style={{ maxWidth: 320, margin: "12px auto 0", padding: "10px 14px", background: "#e0f2fe", borderRadius: 8, border: "1px solid #bae6fd" }}>
            <p style={{ fontSize: 11, color: "#0369a1", lineHeight: 1.5, margin: 0 }}>By proceeding, your full 34 strengths ranking, name, and email will be visible to the quiz creator for training purposes. Your individual answers will remain anonymous.</p>
          </div>
          <p style={{ fontSize: 11, color: "#9999aa", marginTop: 12 }}>Your progress saves automatically. Use the same email to pick up where you left off.</p>
          {email.trim().toLowerCase() === "mickey.ellenwood@gmail.com" && !importMode && !foundSaved && (
            <button onClick={function() { setImportMode(true); }} style={{ marginTop: 10, fontSize: 12, color: "#6D28D9", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>I already have my CliftonStrengths 34 results</button>
          )}
          {importMode && (
            <div style={{ marginTop: 16, textAlign: "left", maxWidth: 420, margin: "16px auto 0", padding: "20px 24px", background: "#f8f7fc", borderRadius: 10, border: "1px solid #e8e6f0" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>Paste your results</p>
              <p style={{ fontSize: 12, color: "#9999aa", margin: "0 0 12px", lineHeight: 1.4 }}>Paste your ranked list of 34 strengths, or copy all the text from your CliftonStrengths PDF and paste it here. We'll find the ranking.</p>
              <textarea value={pasteText} onChange={function(e) { setPasteText(e.target.value); setImportError(""); }} placeholder={"1. Ideation\n2. Activator\n3. Strategic\n..."} style={{ width: "100%", minHeight: 120, padding: 12, borderRadius: 8, border: "1px solid #e8e6f0", fontSize: 13, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box", background: "#fff", color: "#1a1a2e" }} />
              {importError && <p style={{ fontSize: 12, color: "#DC2626", margin: "8px 0 0" }}>{importError}</p>}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={handleImport} style={{ padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "#6D28D9", color: "#fff", fontSize: 14, fontWeight: 600 }}>Load My Results</button>
                <button onClick={function() { setImportMode(false); setPasteText(""); setImportError(""); }} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e8e6f0", cursor: "pointer", background: "#fff", color: "#555570", fontSize: 14 }}>Cancel</button>
              </div>
            </div>
          )}
          {name.trim().toLowerCase() === "test" && <button onClick={function() {
            var testRanked = ["ideation","activator","strategic","relator","competition","communication","adaptability","command","arranger","restorative","self_assurance","maximizer","futuristic","individualization","significance","input","woo","achiever","intellection","learner","positivity","focus","deliberative","analytical","context","empathy","developer","includer","belief","responsibility","discipline","harmony","connectedness","consistency"].map(function(id, i) { return { id: id, score: Math.round(40 - i * 1.2), n: 0 }; });
            props.onStart(false, email || "test@test.com", name || "Test");
            setTimeout(function() { props.onTestResults(testRanked, name || "Test"); }, 100);
          }} style={{ marginTop: 10, fontSize: 11, color: "#9999aa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Preview results page</button>}
        </div>
      )}
    </div>
  );
}

/* ---- QUIZ ---- */
function QuizScreen(props) {
  const [anim, setAnim] = useState(false);
  const [selectedVal, setSelectedVal] = useState(null);
  var queue = props.queue;
  var qi = props.qi;
  var answers = props.answers;
  var phase = props.phase;

  if (!queue || queue.length === 0 || qi >= queue.length) return null;
  var cqi = queue[qi];
  var q = Q[cqi];
  if (!q) return null;

  var textA = q[1];
  var textB = q[2];
  var total = answers.length;

  function pick(val) {
    if (anim) return;
    setSelectedVal(val);
    setAnim(true);
    setTimeout(function() {
      setSelectedVal(null);
      props.onPick(cqi, val);
      setAnim(false);
    }, 350);
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px", minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fff" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 12, color: "#9999aa" }}>{phase === "adaptive" ? "Sharpening your profile" : "Question " + (total + 1)}</div>
          <button onClick={function() { if (props.onExit) props.onExit(); }} style={{ fontSize: 11, color: "#9999aa", background: "none", border: "none", cursor: "pointer", padding: "2px 0", textDecoration: "underline" }}>Save & exit</button>
        </div>
        <div style={{ height: 3, background: "#e8e6f0", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#6D28D9", borderRadius: 2, width: Math.min((total / 200) * 100, 100) + "%", transition: "width 0.4s ease" }} />
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ opacity: anim && !selectedVal ? 0 : 1, transform: anim && !selectedVal ? "translateY(8px)" : "none", transition: "opacity 0.3s ease, transform 0.3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, padding: "0 2px" }}>
            <div style={{ fontSize: 13, color: "#1a1a2e", fontWeight: 600, width: "30%", textAlign: "left" }}>Strongly Describes Me</div>
            <div style={{ fontSize: 13, color: "#1a1a2e", fontWeight: 600, textAlign: "center" }}>Neutral</div>
            <div style={{ fontSize: 13, color: "#1a1a2e", fontWeight: 600, width: "30%", textAlign: "right" }}>Strongly Describes Me</div>
          </div>
          <div style={{ display: "flex", border: "2px solid #ccc", borderRadius: 6, overflow: "hidden", marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map(function(v) {
              var isSelected = selectedVal === v;
              var defaultBg = v === 1 || v === 5 ? "#c8c8c8" : v === 2 || v === 4 ? "#ddd" : "#f0f0f0";
              return (
                <button key={v} onClick={function() { pick(v); }} disabled={anim} style={{
                  flex: 1, padding: "18px 0", cursor: anim ? "default" : "pointer",
                  border: "none", borderRight: v < 5 ? "1px solid #ccc" : "none",
                  background: isSelected ? "#6D28D9" : defaultBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minHeight: 52, transition: "background 0.15s ease",
                }}>{"\u00A0"}</button>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
            <div style={{ flex: 1, fontSize: 16, lineHeight: 1.5, fontWeight: 700, color: selectedVal && selectedVal <= 2 ? "#6D28D9" : "#1a1a2e", transition: "color 0.15s ease" }}>{textA}</div>
            <div style={{ flex: 1, fontSize: 16, lineHeight: 1.5, fontWeight: 700, color: selectedVal && selectedVal >= 4 ? "#6D28D9" : "#1a1a2e", textAlign: "right", transition: "color 0.15s ease" }}>{textB}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- SHARE CARD ---- */
function ShareCard(props) {
  var ranked = props.ranked;
  var name = props.name || "You";
  var top5 = ranked.slice(0, 5);

  function getDomainColor(themeId) {
    var th = TH[themeId];
    return th ? DOMAINS[th.d].color : "#6D28D9";
  }

  return (
    <div style={{ margin: "24px auto", maxWidth: 380, borderRadius: 16, overflow: "hidden", background: "#1a1a2e", padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#6D28D9", marginBottom: 6 }}>Strengths Discovery</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{name}'s Top 5</div>
      </div>
      {top5.map(function(t, i) {
        var th = TH[t.id];
        var dc = getDomainColor(t.id);
        return (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 4, height: 32, borderRadius: 2, background: dc, flexShrink: 0 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", width: 20 }}>{i + 1}.</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{th.n}</div>
          </div>
        );
      })}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {DO.map(function(d) {
            var count = top5.filter(function(t) { return TH[t.id].d === d; }).length;
            if (count === 0) return null;
            return <div key={d} style={{ fontSize: 10, color: DOMAINS[d].color, fontWeight: 600 }}>{DOMAINS[d].name} ({count})</div>;
          })}
        </div>
      </div>
    </div>
  );
}

/* ---- PRINT-TO-PDF ---- */
function printReport(type, ranked, name, insights) {
  var top5 = ranked.slice(0, 5);
  var top10 = ranked.slice(0, 10);
  var domainColors = {executing:"#7C3AED",influencing:"#DC2626",relationship_building:"#2563EB",strategic_thinking:"#059669"};
  var domainBgs = {executing:"#f5f0ff",influencing:"#fef2f2",relationship_building:"#eff6ff",strategic_thinking:"#ecfdf5"};
  function dc(id){var t=TH[id];return t?domainColors[t.d]||"#6D28D9":"#6D28D9";}
  function dbg(id){var t=TH[id];return t?domainBgs[t.d]||"#f5f0ff":"#f5f0ff";}
  function dn(id){var t=TH[id];return t?DOMAINS[t.d].name:"";}

  var css = [
    "*{box-sizing:border-box;margin:0;padding:0}",
    "body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a2e;font-size:10pt;line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact}",
    ".page{padding:48px 54px;min-height:100vh;position:relative}",
    ".page-break{page-break-before:always}",
    // Header
    ".hdr{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1.5px solid #e2e0ea;margin-bottom:32px;font-size:8pt}",
    ".hdr-brand{font-weight:800;color:#6D28D9;letter-spacing:2.5px;text-transform:uppercase}",
    ".hdr-meta{color:#aaa;font-weight:500}",
    // Cover
    ".cover{background:linear-gradient(160deg,#0a0a1a 0%,#1a0a2e 40%,#2d1054 70%,#0a0a1a 100%);color:#fff;display:flex;flex-direction:column;justify-content:flex-end;min-height:100vh;padding:0}",
    ".cover-inner{padding:0 64px 80px}",
    ".cover-label{font-size:9pt;letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:20px;font-weight:600}",
    ".cover-title{font-size:42pt;font-weight:800;line-height:1.05;margin-bottom:16px}",
    ".cover-sub{font-size:12pt;color:rgba(255,255,255,0.4);line-height:1.6;max-width:400px}",
    ".cover-themes{margin-top:44px}",
    ".cover-row{display:flex;align-items:center;gap:16px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.06)}",
    ".cover-num{font-size:26pt;font-weight:800;width:44px;text-align:right}",
    ".cover-tname{font-size:14pt;font-weight:700}",
    ".cover-tdomain{font-size:8pt;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;opacity:0.5}",
    // Section styles
    ".sec-label{font-size:7.5pt;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:6px}",
    ".sec-body{font-size:10pt;color:#444;line-height:1.7}",
    ".callout{padding:24px 28px;border-radius:12px;margin:16px 0;line-height:1.7}",
    ".quote-box{text-align:center;padding:32px;border-radius:14px;background:linear-gradient(135deg,#f5f0ff,#eff6ff);border:1px solid #e8e6f0;margin:20px 0}",
    ".quote-text{font-size:14pt;font-weight:700;color:#1a1a2e;line-height:1.45}",
    // Theme pages
    ".theme-hdr{margin-bottom:20px}",
    ".theme-rank{font-size:48pt;font-weight:900;line-height:1}",
    ".theme-name{font-size:26pt;font-weight:800;line-height:1.15}",
    ".theme-domain{font-size:8pt;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-top:4px}",
    ".theme-bar{height:3px;border:none;border-radius:2px;margin:14px 0}",
    ".theme-thrive{font-size:11pt;color:#333;line-height:1.7;font-style:italic;margin-bottom:16px}",
    ".theme-section{margin-top:20px}",
    ".theme-section h3{font-size:11pt;font-weight:700;color:#1a1a2e;margin-bottom:6px}",
    ".theme-section p{font-size:9.5pt;color:#555;line-height:1.65;margin-bottom:8px}",
    // Blind spots
    ".bs-box{padding:18px 22px;border-radius:10px;background:#fafafa;border-left:3px solid #999;margin:8px 0;font-size:9.5pt;color:#555;line-height:1.6}",
    // Action items
    ".ai-item{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f0eff5}",
    ".ai-num{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8pt;font-weight:800;color:#fff;flex-shrink:0;margin-top:2px}",
    ".ai-text{font-size:9.5pt;color:#444;line-height:1.6}",
    // Blend cards
    ".blend-card{margin-bottom:12px;border-radius:10px;overflow:hidden;border:1px solid #e8e6f0}",
    ".blend-hdr{padding:10px 16px;display:flex;align-items:center;gap:8px}",
    ".blend-title{font-weight:700;font-size:10pt;color:#fff}",
    ".blend-plus{font-size:11pt;font-weight:300;color:rgba(255,255,255,0.5)}",
    ".blend-body{padding:12px 16px;font-size:9.5pt;line-height:1.6;color:#444}",
    ".blend-tag{font-weight:700;color:#1a1a2e;margin-bottom:3px}",
    // Full 34
    ".rank-row{display:flex;align-items:center;gap:10px;padding:5px 2px;border-bottom:1px solid #f5f4fa}",
    ".rank-num{width:26px;font-weight:700;font-size:10pt;text-align:right;color:#ccc}",
    ".rank-bar{height:5px;border-radius:3px;min-width:3px}",
    ".rank-name{font-weight:600;font-size:10pt;flex:1}",
    ".rank-domain{font-size:7.5pt;font-weight:600;letter-spacing:1px;text-transform:uppercase}",
    ".band-label{font-size:12pt;font-weight:800;margin:24px 0 4px}",
    ".band-desc{font-size:9pt;color:#999;margin-bottom:10px}",
    // Full 34 theme compact
    ".f34-theme{page-break-inside:avoid;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid #eeecf5}",
    ".f34-hdr{display:flex;align-items:center;gap:14px;margin-bottom:8px}",
    ".f34-rank{font-size:20pt;font-weight:900;width:36px;text-align:right}",
    ".f34-name{font-size:14pt;font-weight:800}",
    ".f34-domain{font-size:7.5pt;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}",
    ".f34-thrive{font-size:10pt;color:#333;font-style:italic;line-height:1.6;margin-bottom:10px}",
    ".f34-desc{font-size:9.5pt;color:#555;line-height:1.6;margin-bottom:10px}",
    ".f34-bs{padding:12px 16px;border-radius:8px;background:#fafafa;border-left:3px solid #ddd;margin:6px 0;font-size:9pt;color:#666;line-height:1.55}",
    ".f34-copy{font-size:10pt;color:#444;line-height:1.65;margin-bottom:6px}",
    ".f34-label{font-size:7.5pt;font-weight:700;color:#888;letter-spacing:2px;text-transform:uppercase;margin:12px 0 6px;padding-top:8px;border-top:1px solid #f0eff5}",
    // Domain balance
    ".domain-block{padding:16px 20px;border-radius:10px;margin-bottom:10px;display:flex;align-items:center;gap:16px}",
    ".domain-bar{height:8px;border-radius:4px;flex:1}",
    ".domain-name{font-size:10pt;font-weight:700;width:140px}",
    ".domain-count{font-size:10pt;font-weight:700;width:30px;text-align:right}",
    // Reflection
    ".refl-item{padding:14px 18px;border-radius:8px;background:#f8f7fc;border:1px solid #e8e6f0;margin-bottom:8px;font-size:10pt;color:#444;line-height:1.5}",
    // Summary page
    ".summary-pg{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;min-height:100vh;padding:60px}",
    ".pill{display:inline-block;padding:7px 18px;border-radius:22px;font-weight:700;font-size:10pt;margin:0 4px 8px}",
    // Print overrides
    "@media print{.page{padding:36px 44px} .cover{-webkit-print-color-adjust:exact;print-color-adjust:exact} .theme-rank,.cover-num,.ai-num,.blend-hdr{-webkit-print-color-adjust:exact;print-color-adjust:exact} .no-print{display:none!important}}"
  ].join("\n");

  var html = "<html><head><title>"+(name||"")+" - "+(type==="top5"?"Top 5 Strengths Report":"Full 34 Strengths Report")+"</title><style>"+css+"</style></head><body>";

  // ===== TOP 5 REPORT =====
  if (type === "top5") {

    // --- 1. COVER PAGE ---
    html += "<div class='cover'><div class='cover-inner'>";
    html += "<div class='cover-label'>Strengths Discovery</div>";
    html += "<div class='cover-title'>"+(name||"Your")+"&rsquo;s<br/>Top 5 Strengths</div>";
    html += "<div class='cover-sub'>A personalized report on your five most defining strengths&mdash;how they show up, where they help, and how to use them with more intention.</div>";
    html += "<div class='cover-themes'>";
    top5.forEach(function(t,i){
      html += "<div class='cover-row'><div class='cover-num' style='color:"+dc(t.id)+"'>"+(i+1)+"</div><div><div class='cover-tname'>"+TH[t.id].n+"</div><div class='cover-tdomain' style='color:"+dc(t.id)+"'>"+dn(t.id)+"</div></div></div>";
    });
    html += "</div></div></div>";

    // --- 2. INTRO PAGE ---
    html += "<div class='page page-break'>";
    html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>"+(name||"")+"</span></div>";
    html += "<h2 style='font-size:22pt;font-weight:800;margin-bottom:16px'>How to Use This Report</h2>";
    html += "<p class='sec-body' style='margin-bottom:16px'>This report focuses on your five most defining strengths. These are not personality labels or fixed categories. They are patterns of thinking, feeling, and behaving that show up most naturally and consistently in how you work, lead, and contribute.</p>";
    html += "<p class='sec-body' style='margin-bottom:16px'>The goal is not to put you in a box. It is to help you see more clearly what you already do well, where those strengths help the most, where they can create friction, and how to apply them with more intention.</p>";
    html += "<p class='sec-body' style='margin-bottom:16px'>The best development work usually comes from making your strongest patterns healthier, more mature, and better aimed&mdash;not from trying to fix everything that is less natural. Where you are less strong, the better solution is often partnership, structure, or collaboration rather than forcing a personality rewrite.</p>";
    html += "<p class='sec-body' style='color:#999;font-size:9pt'>Read slowly. Mark what resonates. Bring it to a conversation with someone who knows your work.</p>";
    html += "</div>";

    // --- 3. TOP 5 OVERVIEW SPREAD ---
    html += "<div class='page page-break'>";
    html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>Top 5 Overview</span></div>";
    html += "<h2 style='font-size:22pt;font-weight:800;margin-bottom:24px'>Your Top 5 Strengths</h2>";
    top5.forEach(function(t,i){
      var th=TH[t.id]; var col=dc(t.id); var rd=REVEAL_DATA[t.id]||{};
      html += "<div style='display:flex;gap:18px;align-items:flex-start;padding:18px 0;"+(i<4?"border-bottom:1px solid #eeecf5;":"")+"'>";
      html += "<div style='font-size:32pt;font-weight:900;color:"+col+";width:48px;text-align:right;line-height:1'>"+(i+1)+"</div>";
      html += "<div style='flex:1'>";
      html += "<div style='font-size:16pt;font-weight:800;color:#1a1a2e'>"+th.n+"</div>";
      html += "<div style='font-size:8pt;font-weight:700;color:"+col+";letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px'>"+dn(t.id)+"</div>";
      html += "<div style='font-size:9.5pt;color:#666;line-height:1.5'>"+th.thrive+"</div>";
      html += "</div>";
      if (rd.pct) {
        var rarity = rd.pct<=8?"Rare":rd.pct<=15?"Uncommon":"Common";
        html += "<div style='text-align:right;flex-shrink:0'><div style='font-size:9pt;font-weight:700;color:"+col+"'>"+rd.pct+"%</div><div style='font-size:7.5pt;color:#aaa'>have in top 5</div></div>";
      }
      html += "</div>";
    });
    html += "</div>";

    // --- 4. TOP 5 SYNTHESIS PAGE ---
    if (insights && (insights.fullProfile || insights.summary)) {
      html += "<div class='page page-break'>";
      html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>Profile Synthesis</span></div>";
      html += "<h2 style='font-size:22pt;font-weight:800;margin-bottom:6px'>How Your Top 5 Work Together</h2>";
      html += "<p style='font-size:10pt;color:#999;margin-bottom:24px'>Your strengths do not operate independently. Here is how they combine into a distinct working style.</p>";
      if (insights.summary) {
        html += "<div class='quote-box'>";
        html += "<div style='font-size:7.5pt;font-weight:700;color:#6D28D9;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px'>Your Operating Style</div>";
        html += "<div class='quote-text'>&ldquo;"+insights.summary+"&rdquo;</div>";
        html += "</div>";
      }
      if (insights.fullProfile) {
        html += "<div style='margin:24px 0'>";
        html += "<div class='sec-label' style='color:#6D28D9'>Who You Are at Your Best</div>";
        html += "<p class='sec-body'>"+insights.fullProfile+"</p>";
        html += "</div>";
      }
      if (insights.dominantDomain) {
        html += "<div style='margin:24px 0'>";
        html += "<div class='sec-label' style='color:#6D28D9'>Your Domain Mix</div>";
        html += "<p class='sec-body'>"+insights.dominantDomain+"</p>";
        html += "</div>";
      }
      if (insights.blindSpotProfile) {
        html += "<div class='callout' style='background:#fef8f8;border:1px solid #fecaca'>";
        html += "<div class='sec-label' style='color:#DC2626'>Your Combination Blind Spots</div>";
        html += "<p class='sec-body'>"+insights.blindSpotProfile+"</p>";
        html += "</div>";
      }
      html += "</div>";
    }

    // --- 5. INDIVIDUAL THEME SECTIONS (1-2 pages each) ---
    top5.forEach(function(t,i){
      var th=TH[t.id]; var col=dc(t.id); var bg=dbg(t.id);
      var ins = insights && insights.themes ? insights.themes[t.id] : null;
      var rd = REVEAL_DATA[t.id]||{};

      // Theme header page
      html += "<div class='page page-break'>";
      html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>"+(name||"")+" &middot; Strength #"+(i+1)+"</span></div>";

      // A. Title block
      html += "<div class='theme-hdr'>";
      html += "<div style='display:flex;align-items:flex-end;gap:16px'>";
      html += "<div class='theme-rank' style='color:"+col+"'>"+(i+1)+"</div>";
      html += "<div><div class='theme-name'>"+th.n+"</div>";
      html += "<div class='theme-domain' style='color:"+col+"'>"+dn(t.id)+"</div></div></div>";
      html += "<hr class='theme-bar' style='background:"+col+"'/>";
      html += "<div class='theme-thrive'>"+th.thrive+"</div>";
      html += "</div>";

      // B. How this shows up at work
      html += "<div class='theme-section'>";
      html += "<h3 style='color:"+col+"'>How This Shows Up at Work</h3>";
      html += "<p>"+th.atWork+"</p>";
      html += "</div>";

      html += "<div class='theme-section'>";
      html += "<h3 style='color:"+col+"'>At Your Best</h3>";
      html += "<p>"+th.atBest+"</p>";
      html += "</div>";

      // Personalized unique (AI)
      if (ins && ins.unique) {
        html += "<div class='theme-section'>";
        html += "<h3 style='color:"+col+"'>Why Your "+th.n+" Is Unique</h3>";
        html += "<p><em>These insights are personalized based on your specific combination of strengths.</em></p>";
        html += "<p>"+ins.unique+"</p>";
        html += "</div>";
      }

      html += "<div class='theme-section'>";
      html += "<h3 style='color:"+col+"'>How to Lean In</h3>";
      html += "<p>"+th.leanIn+"</p>";
      html += "</div>";

      // C. Blind spots
      if (th.blindSpots && th.blindSpots.length > 0) {
        html += "<div class='theme-section' style='margin-top:24px'>";
        html += "<h3 style='color:#777'>Where This Can Get Tricky</h3>";
        th.blindSpots.forEach(function(bs) {
          html += "<div class='bs-box'>"+bs+"</div>";
        });
        html += "</div>";
      }

      // D. Action items (Top 5 only)
      if (th.actionItems && th.actionItems.length > 0) {
        html += "<div class='theme-section' style='margin-top:24px'>";
        html += "<h3 style='color:"+col+"'>Apply Your "+th.n+"</h3>";
        th.actionItems.forEach(function(item, idx) {
          html += "<div class='ai-item'><span class='ai-num' style='background:"+col+"'>"+(idx+1)+"</span><span class='ai-text'>"+item+"</span></div>";
        });
        html += "</div>";
      }

      html += "</div>"; // end theme page
    });

    // --- 5b. BLENDS PAGE ---
    if (insights && insights.blends && insights.blends.length > 0) {
      html += "<div class='page page-break'>";
      html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>Strength Combinations</span></div>";
      html += "<h2 style='font-size:22pt;font-weight:800;margin-bottom:6px'>How Your Strengths Combine</h2>";
      html += "<p style='font-size:10pt;color:#999;margin-bottom:24px'>Your top 5 do not operate in isolation. Here is how they interact to create something distinct.</p>";
      insights.blends.forEach(function(b) {
        var nameA = TH[b.a] ? TH[b.a].n : b.a;
        var nameB = TH[b.b] ? TH[b.b].n : b.b;
        var colA = TH[b.a] ? dc(b.a) : "#6D28D9";
        html += "<div class='blend-card'>";
        html += "<div class='blend-hdr' style='background:"+colA+"'><span class='blend-title'>"+nameA+"</span><span class='blend-plus'>+</span><span class='blend-title'>"+nameB+"</span></div>";
        html += "<div class='blend-body'><div class='blend-tag'>"+b.text+"</div>";
        if (b.detail) html += "<div style='color:#666;margin-top:3px'>"+b.detail+"</div>";
        html += "</div></div>";
      });
      html += "</div>";
    }

    // --- 6. DOMAIN BALANCE PAGE ---
    html += "<div class='page page-break'>";
    html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>Domain Balance</span></div>";
    html += "<h2 style='font-size:22pt;font-weight:800;margin-bottom:6px'>Your Domain Balance</h2>";
    html += "<p style='font-size:10pt;color:#999;margin-bottom:24px'>How your top 5 distribute across the four strength domains.</p>";
    var domCounts = {};
    DO.forEach(function(d) { domCounts[d] = 0; });
    top5.forEach(function(t) { domCounts[TH[t.id].d]++; });
    var domDescs = {
      executing: "Executing themes drive implementation. People strong here make things happen through effort, consistency, and follow-through.",
      influencing: "Influencing themes drive reach. People strong here take charge, speak up, and move others toward action.",
      relationship_building: "Relationship Building themes drive connection. People strong here build trust, hold teams together, and create environments where people thrive.",
      strategic_thinking: "Strategic Thinking themes drive analysis. People strong here absorb information, think ahead, and help the team make smarter decisions."
    };
    DO.forEach(function(d) {
      var col = DOMAINS[d].color;
      var count = domCounts[d];
      html += "<div class='domain-block' style='background:"+domainBgs[d]+";border:1px solid "+col+"22'>";
      html += "<div class='domain-name' style='color:"+col+"'>"+DOMAINS[d].name+"</div>";
      html += "<div style='flex:1'><div class='domain-bar' style='background:"+col+";width:"+(count > 0 ? (count/5*100) : 2)+"%'></div></div>";
      html += "<div class='domain-count' style='color:"+col+"'>"+count+"</div>";
      html += "</div>";
      if (count > 0) {
        html += "<p style='font-size:9pt;color:#888;margin:-4px 0 12px 156px;line-height:1.5'>"+domDescs[d]+"</p>";
      }
    });
    html += "</div>";

    // --- 7. REFLECTION PAGE ---
    html += "<div class='page page-break'>";
    html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>Reflection</span></div>";
    html += "<h2 style='font-size:22pt;font-weight:800;margin-bottom:6px'>Using This Report</h2>";
    html += "<p style='font-size:10pt;color:#999;margin-bottom:24px'>Questions to bring to a coaching conversation, a manager check-in, or your own reflection.</p>";
    var reflections = [
      "Which of these five strengths do you rely on most often? Is it the one serving you best, or just the one that is most habitual?",
      "Which strength tends to get overused when you are under pressure or stress?",
      "Is there a strength in your top 5 that you have been underusing or that your current role does not fully reward?",
      "How do your top strengths combine in a way that creates a distinct advantage? Where does that combination create friction?",
      "What is one specific action from this report you want to apply in the next two weeks?"
    ];
    reflections.forEach(function(r) {
      html += "<div class='refl-item'>"+r+"</div>";
    });
    html += "<div style='margin-top:32px;text-align:center'>";
    html += "<div style='display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:20px'>";
    top5.forEach(function(t) {
      html += "<span class='pill' style='color:"+dc(t.id)+";background:"+dbg(t.id)+";border:1px solid "+dc(t.id)+"22'>"+TH[t.id].n+"</span>";
    });
    html += "</div>";
    html += "<p style='font-size:10pt;color:#bbb'>Strengths Discovery &middot; "+(new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}))+"</p>";
    html += "</div></div>";

  // ===== FULL 34 REPORT =====
  } else {

    // --- 1. COVER PAGE ---
    html += "<div class='cover'><div class='cover-inner'>";
    html += "<div class='cover-label'>Strengths Discovery</div>";
    html += "<div class='cover-title'>Full 34<br/>Strengths Report</div>";
    html += "<div class='cover-sub'>A complete view of your strengths profile</div>";
    html += "<div style='margin-top:44px;font-size:16pt;font-weight:600;color:rgba(255,255,255,0.85)'>"+(name||"")+"</div>";
    html += "<div style='margin-top:6px;font-size:10pt;color:rgba(255,255,255,0.35)'>"+(new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}))+"</div>";
    html += "</div></div>";

    // --- 2. INTRO PAGE: How to Read This Report ---
    html += "<div class='page page-break'>";
    html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>"+(name||"")+"</span></div>";
    html += "<h2 style='font-size:22pt;font-weight:800;margin-bottom:20px'>How to Read This Report</h2>";
    html += "<p class='sec-body' style='margin-bottom:14px'>This report shows all 34 strengths themes in rank order, from most dominant to least dominant. The themes at the top of your profile are the clearest patterns in how you naturally think, work, and contribute. As you move down the ranking, the themes become less instinctive and less central, but they do not become flaws.</p>";
    html += "<p class='sec-body' style='margin-bottom:14px'>Your lower-ranked themes are not weaknesses to fix. They are simply less dominant patterns in your profile. The goal is not to become equally strong in all 34 themes, but to understand where you naturally lead and use those strengths with more intention.</p>";
    html += "<p class='sec-body' style='margin-bottom:14px'>This report is designed to give you a complete view of your profile. It is meant to help you recognize which strengths are most natural to you, which ones support you in the right context, and which ones are less likely to be part of your default style. The most valuable development work usually comes from strengthening the healthiest expression of your top themes, not from trying to force equal growth across all 34.</p>";
    html += "<p class='sec-body'>Use this report as a map, not a mandate. It is here to help you understand the full shape of your strengths, not to turn every lower-ranked theme into a problem to solve.</p>";
    html += "</div>";

    // --- 3. FULL RANKING OVERVIEW ---
    html += "<div class='page page-break'>";
    html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>"+(name||"")+" &middot; Full Ranking</span></div>";
    html += "<h2 style='font-size:22pt;font-weight:800;margin-bottom:20px'>Your Full Ranking</h2>";

    var maxScore = ranked[0] ? ranked[0].score : 1;
    var bands = [
      {name:"The Top 5",sub:"Dominant",desc:"Your most defining strengths.",s:0,e:5,color:"#6D28D9"},
      {name:"6\u201310",sub:"Supporting",desc:"Strong supporting themes that add meaningful range.",s:5,e:10,color:"#2563EB"},
      {name:"11\u201317",sub:"Available",desc:"Present and available, but not primary lead patterns.",s:10,e:17,color:"#0891B2"},
      {name:"18\u201326",sub:"Situational",desc:"Less instinctive. Not weaknesses, just less likely to lead with.",s:17,e:26,color:"#059669"},
      {name:"27\u201334",sub:"Least Dominant",desc:"Less central to how you naturally operate.",s:26,e:34,color:"#9CA3AF"}
    ];
    bands.forEach(function(band){
      html += "<div style='margin-top:16px;margin-bottom:4px;display:flex;align-items:baseline;gap:10px'>";
      html += "<span style='font-size:11pt;font-weight:800;color:"+band.color+"'>"+band.name+"</span>";
      html += "<span style='font-size:8pt;font-weight:600;color:"+band.color+";letter-spacing:1.5px;text-transform:uppercase;opacity:0.7'>"+band.sub+"</span>";
      html += "</div>";
      html += "<div style='font-size:8.5pt;color:#999;margin-bottom:6px'>"+band.desc+"</div>";
      for(var i=band.s;i<Math.min(band.e,ranked.length);i++){
        var t=ranked[i]; var th=TH[t.id]; var col=dc(t.id); var isT5=i<5;
        var barW = Math.max(3, Math.round((t.score/maxScore)*160));
        html += "<div class='rank-row' style='"+(isT5?"background:#f8f7fc;border-radius:6px;padding:5px 8px;":"")+"'>";
        html += "<div class='rank-num' style='color:"+(isT5?col:"#ccc")+";font-weight:"+(isT5?"800":"600")+"'>"+(i+1)+"</div>";
        html += "<div class='rank-bar' style='width:"+barW+"px;background:"+col+";opacity:"+(isT5?"1":"0.6")+"'></div>";
        html += "<div class='rank-name' style='font-weight:"+(isT5?"800":"600")+"'>"+th.n+"</div>";
        html += "<div class='rank-domain' style='color:"+col+"'>"+dn(t.id)+"</div></div>";
      }
    });
    html += "</div>";

    // --- 4. BIG PICTURE: What Stands Out ---
    html += "<div class='page page-break'>";
    html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>"+(name||"")+" &middot; Big Picture</span></div>";
    html += "<h2 style='font-size:22pt;font-weight:800;margin-bottom:6px'>What Stands Out in Your Profile</h2>";
    html += "<p style='font-size:10pt;color:#999;margin-bottom:24px'>A synthesis of your full 34 ranking.</p>";

    // AI interpretation
    if (insights && insights.full34Interpretation) {
      html += "<div style='margin-bottom:24px'><p class='sec-body'>"+insights.full34Interpretation+"</p></div>";
    } else if (insights && insights.fullProfile) {
      html += "<div style='margin-bottom:24px'><p class='sec-body'>"+insights.fullProfile+"</p></div>";
    }

    // Domain distribution
    var domainCounts = {executing:0,influencing:0,relationship_building:0,strategic_thinking:0};
    var domainTop10 = {executing:0,influencing:0,relationship_building:0,strategic_thinking:0};
    ranked.forEach(function(t,i){
      domainCounts[TH[t.id].d]++;
      if(i<10) domainTop10[TH[t.id].d]++;
    });
    html += "<div style='margin-top:20px'>";
    html += "<div class='sec-label' style='color:#6D28D9;margin-bottom:12px'>Domain Distribution</div>";
    var domOrder = ["strategic_thinking","executing","influencing","relationship_building"];
    domOrder.forEach(function(did){
      var dname = DOMAINS[did].name;
      var dcol = domainColors[did];
      var total = domainCounts[did];
      var inTop = domainTop10[did];
      var barPct = Math.round((total/34)*100);
      html += "<div style='display:flex;align-items:center;gap:12px;margin-bottom:8px'>";
      html += "<div style='width:130px;font-size:9pt;font-weight:600;color:#333'>"+dname+"</div>";
      html += "<div style='flex:1;height:8px;background:#f0eff5;border-radius:4px;overflow:hidden'><div style='height:100%;width:"+barPct+"%;background:"+dcol+";border-radius:4px'></div></div>";
      html += "<div style='width:80px;text-align:right;font-size:8.5pt;color:#888'>"+total+" total";
      if(inTop>0) html += " <span style='color:"+dcol+";font-weight:700'>("+inTop+" in top 10)</span>";
      html += "</div></div>";
    });
    html += "</div>";

    // AI domain interpretation
    if (insights && insights.full34DomainMix) {
      html += "<div style='margin-top:16px'><p class='sec-body'>"+insights.full34DomainMix+"</p></div>";
    } else if (insights && insights.dominantDomain) {
      html += "<div style='margin-top:16px'><p class='sec-body'>"+insights.dominantDomain+"</p></div>";
    }
    html += "</div>";

    // --- SECTIONS 5-9: THEME ENTRIES BY BUCKET ---
    // Helper: generate rank-specific intro text
    function rankIntro(ri, th) {
      var n = th.n;
      var intA = th.introAction||"use"; var intO = th.introObject||"this strength"; var intP = th.introPayoff||"so the work benefits";
      // Top 5 rank-specific intros
      if (ri===0) return n+" is your top strength. This is likely the clearest and most consistent pattern in how you naturally think, work, and contribute.";
      if (ri===1) return n+" is one of the strongest forces in your profile. It likely shapes how you operate across a wide range of situations, even when you are not consciously relying on it.";
      if (ri===2) return n+" sits firmly in the core of your profile. This is still one of the most natural and defining ways you tend to work and contribute.";
      if (ri===3) return n+" is a clear lead strength for you. Even if it is not the strongest single theme in your profile, it is still one of the most consistent ways you are likely to show up at your best.";
      if (ri===4) return n+" rounds out your top five and belongs to the most defining part of your profile. This is still a true signature strength, not just a helpful extra.";
      // 6-10
      if (ri===5) return n+" sits just outside your top five. It may not define you as strongly as your most dominant themes, but it likely plays a meaningful supporting role in how you operate.";
      if (ri===6) return n+" is a strong supporting strength in your profile. It may not be one of the first patterns people notice, but it likely adds real range and usefulness to how you work.";
      if (ri===7) return n+" is still clearly above the middle of your profile. It may not sit at the center of how you lead, but it likely shows up often enough to matter.";
      if (ri===8) return n+" remains one of the stronger themes in your profile. This is not a primary defining strength, but it is still likely to influence how you think, work, or relate in noticeable ways.";
      if (ri===9) return n+" closes out your top ten. It is still a meaningful part of your profile, even if it sits just outside the strongest inner circle of your themes.";
      // 11-17
      if (ri===10) return n+" is present in a noticeable way, but it is no longer part of the strongest tier of your profile. You may draw on it regularly without it feeling especially central.";
      if (ri===11) return n+" sits in the upper-middle of your profile. It is available to you, even if it is not one of the themes that most clearly defines your natural style.";
      if (ri===12) return n+" is a real part of your profile, but not a dominant one. You may notice it more in the right environment than as a constant default.";
      if (ri===13) return n+" is present, though not especially central. It may support you in certain kinds of situations without being one of the patterns you lead with most often.";
      if (ri===14) return n+" falls in the upper-middle of your ranking. This suggests it is available to you, even if it is not one of the clearest drivers of how you naturally operate.";
      if (ri===15) return n+" appears to be more available than defining in your profile. You may be able to access it when needed without it feeling especially instinctive or identity-level.";
      if (ri===16) return n+" sits near the midpoint of your profile. It is part of how you can operate, but not one of the strongest or most natural ways you tend to lead.";
      // 18-26
      if (ri===17) return n+" begins the more situational part of your profile. This does not make it a weakness, but it does suggest it is less instinctive and less central than the themes above it.";
      if (ri===18) return n+" is a less instinctive theme for you. It may still matter in the right setting, but it is not likely to be one of your first or strongest defaults.";
      if (ri===19) return n+" appears to be more situational than natural in your profile. You may use it when the context calls for it without relying on it as a regular lead pattern.";
      if (ri===20) return n+" sits in the lower half of your ranking. That suggests it is available in certain moments, but less likely to show up as one of your instinctive ways of operating.";
      if (ri===21) return n+" is less central to your profile than the themes ranked above it. It may still have value, but it is probably not one of the first energies you naturally reach for.";
      if (ri===22) return n+" ranks lower in your profile and is likely to be more context-dependent than instinctive. You may draw on it when needed without strongly identifying with it.";
      if (ri===23) return n+" is one of the less natural themes in your ranking. This does not mean it is absent, only that it is less likely to shape how you operate on its own.";
      if (ri===24) return n+" appears lower in your profile and is probably not a strength you lead with often. It may be more visible under certain demands than as part of your default style.";
      if (ri===25) return n+" is a lower-ranked theme for you. It may still have uses in the right setting, but it is not one of the patterns that comes most naturally or consistently.";
      // 27-34
      if (ri===26) return n+" sits near the bottom of your profile. This suggests it is not a pattern you instinctively reach for in most situations.";
      if (ri===27) return n+" is one of the less instinctive themes in your ranking. It may still appear when needed, but it is not a place you naturally lead from very often.";
      if (ri===28) return n+" falls in the lowest stretch of your profile. That does not make it a flaw, only a theme that is less dominant and less natural for you than the ones ranked above it.";
      if (ri===29) return n+" is one of the least central themes in your profile. You may value what it offers without naturally using it as a primary way of working or contributing.";
      if (ri===30) return n+" sits very near the bottom of your ranking. It is likely less intuitive for you and less likely to show up without specific context or support.";
      if (ri===31) return n+" is among your least dominant themes. This suggests it is not a strength you naturally lean on, even if it may still matter in certain settings.";
      if (ri===32) return n+" is one of the very lowest themes in your profile. It is not missing, but it is unlikely to be one of the ways you most naturally think, work, or relate.";
      if (ri===33) return n+" is your lowest-ranked theme in this report. That does not make it a weakness to fix, but it does suggest this is not a natural lead pattern for you and is less central to how you typically operate.";
      return n+" is part of your profile.";
    }

    // Helper: context line (thrive/available/low)
    function contextLine(ri, th) {
      var intA = th.introAction||"use"; var intO = th.introObject||"this strength"; var intP = th.introPayoff||"";
      if (ri<5) {
        var starters = ["You thrive when you can ","You are at your best when you can ","This strength comes alive when you can ","You tend to excel when you can ","This strength is especially active when you can "];
        return starters[ri]+intA+" "+intO+(intP?", "+intP:"")+".";
      }
      if (ri<10) {
        var s6 = ["This strength tends to help when you can ","You are likely to benefit from this theme when you can ","This strength often becomes useful when you can ","You may draw on this most when you can ","This strength is often helpful when you can "];
        return s6[ri-5]+intA+" "+intO+(intP?", "+intP:"")+".";
      }
      if (ri<17) {
        var s7 = ["This theme tends to help when you need to ","You may be most likely to use this strength when you need to ","This theme is likely to be useful when you need to ","You can likely draw on it when you need to ","This strength tends to become useful when you need to ","You may lean on this theme when you need to ","This theme can still be useful when you need to "];
        return s7[ri-10]+intA+" "+intO+(intP?", "+intP:"")+".";
      }
      if (ri<26) {
        var s8 = ["This theme may still be useful when you need to ","You may still benefit from this theme when you need to ","This strength may help in moments where you need to ","This theme may matter when you need to ","You may still find this strength useful when you need to ","This theme may still help when you need to ","This theme may be useful when you need to ","Even so, this theme can help when you need to ","This theme may still matter when you need to "];
        return s8[ri-17]+intA+" "+intO+(intP?", "+intP:"")+".";
      }
      // 27-34
      var s9 = ["This is less natural for you, but it can still help when you need to ","While this is not a default strength, it may still be useful when you need to ","This is not a strength you are likely to lead with, but it can still matter when you need to ","Even at this rank, it can still be helpful when you need to ","This is not likely to be a natural instinct, but it can still help when you need to ","This may not be your first instinct, but it can still add value when you need to ","This is a pattern you are not likely to lead with, though it can still matter when you need to ","This is the least instinctive theme in your profile, though it can still help when you need to "];
      var idx = Math.min(ri-26, s9.length-1);
      return s9[idx]+intA+" "+intO+(intP?", "+intP:"")+".";
    }

    // Helper: core line
    function coreLine(ri, th) {
      var nt = th.naturalTendency||""; var at = th.availableTendency||""; var cc = th.coreContext||""; var cr = th.coreResult||"";
      if (ri<5) {
        var labels = ["At your best","Core pattern","Signature tendency","At your strongest","Natural style"];
        return "<strong>"+labels[ri]+":</strong> You naturally "+nt+". This is most powerful when "+cc+", helping you "+cr+".";
      }
      if (ri<10) {
        var lb6 = ["Strong support","In practice","Supporting pattern","Usual contribution","Reliable support"];
        return "<strong>"+lb6[ri-5]+":</strong> You often "+(at||nt)+". This becomes especially useful when "+cc+", helping you "+cr+".";
      }
      if (ri<17) {
        var lb7 = ["Available tool","Situational asset","Available range","In practice","Situational pattern","Useful, not central","On the bench, not off the field"];
        return "<strong>"+lb7[ri-10]+":</strong> You can draw on this when you need to "+(at||nt)+". It tends to help most when "+cc+", so you can "+cr+".";
      }
      if (ri<26) {
        var ld = th.lowDefault||""; var lm = th.lowMiss||""; var lr = th.lowRisk||"";
        var lb8 = ["Less natural tendency","Situational use","Available on purpose","Less automatic","Deliberate access","Situational lane","Not your default","Pulled forward by context","Less instinctive lane"];
        var idx = ri-17;
        return "<strong>"+lb8[idx]+":</strong> You are less likely to "+ld+". Because of that, "+lm+", which can "+lr+".";
      }
      // 27-34
      var dt = th.defaultTendency||""; var tp = th.themePriority||""; var ld2 = th.lowDefault||""; var lm2 = th.lowMiss||""; var lr2 = th.lowRisk||"";
      var lb9 = ["Secondary choice","Not a first move","Infrequent instinct","Quiet preference","Weak reflex under pressure","Unreliable reflex","Quiet blind spot","True blind spot"];
      var idx2 = Math.min(ri-26, lb9.length-1);
      return "<strong>"+lb9[idx2]+":</strong> Because you may naturally prioritize "+dt+" over "+tp+", you are less likely to "+ld2+". That means "+lm2+", which can "+lr2+".";
    }

    // Helper: special section (blind spots / watch for / underused advantage / works best when / support strategy)
    function specialSection(ri, th) {
      if (ri<5) {
        // BLIND SPOTS
        var s = "<div class='f34-label'>BLIND SPOTS</div>";
        s += "<p class='f34-copy'>Because this strength is so immediate for you, "+th.overuseTrigger1+", "+th.overusePattern1+", "+th.overuseCost1+".</p>";
        s += "<p class='f34-copy'>"+["You may also find that ","There may also be moments when ","You can also run into situations where ","There are also times when ","You may also notice that "][ri]+th.overuseTrigger2+", "+th.overusePattern2+", "+th.overuseCost2+".</p>";
        return s;
      }
      if (ri<10) {
        // WATCH FOR
        var s = "<div class='f34-label'>WATCH FOR</div>";
        var openers = ["In the wrong setting, ","When you rely on it too quickly, ","One thing to watch is that ","Sometimes ","Under pressure, "];
        s += "<p class='f34-copy'>"+openers[ri-5]+th.overuseTrigger1+", "+th.overusePattern1+", "+th.overuseCost1+".</p>";
        s += "<p class='f34-copy'>You may also find that "+th.overuseTrigger2+", "+th.overusePattern2+", "+th.overuseCost2+".</p>";
        return s;
      }
      if (ri<17) {
        // UNDERUSED ADVANTAGE
        var s = "<div class='f34-label'>UNDERUSED ADVANTAGE</div>";
        var ua = th.underuseAdvantage||""; var um = th.underuseMiss||""; var uc = th.underuseCost||"";
        var ac = th.awarenessCue||"";
        var openers7 = [
          "Because this is not a constant default, you may not always notice when leaning into "+ua+" would help. Left alone, "+um+", which can "+uc+".",
          "The challenge here is usually not overuse, but under-leveraging. You may not always recognize when "+ua+" would give you an edge, and "+um+", which can "+uc+".",
          "Because this theme is more situational than automatic, you may overlook moments when "+ua+" would serve you. As a result, "+um+", which can "+uc+".",
          "This strength may create more value for you than you naturally remember to access. When you do not reach for it, "+um+", which can "+uc+".",
          "Since this is not one of your strongest defaults, you may not always spot when "+ua+" would be worth using. That can mean "+um+", which may "+uc+".",
          "Because this theme is more available than automatic, you may not consistently remember to use it. When that happens, "+um+", which can "+uc+".",
          "At this rank, the risk is usually inconsistency rather than excess. You may not always notice when "+ua+" would help, and "+um+", which can "+uc+"."
        ];
        s += "<p class='f34-copy'>"+openers7[ri-10]+"</p>";
        s += "<p class='f34-copy' style='font-weight:600'>Use this more intentionally when: "+ac+"</p>";
        return s;
      }
      if (ri<26) {
        // WORKS BEST WHEN
        var sc = th.supportCondition||""; var ss = th.supportStructure||""; var sb = th.supportBenefit||""; var ac = th.awarenessCue||"";
        var s = "<div class='f34-label'>WORKS BEST WHEN</div>";
        s += "<p class='f34-copy'>This theme becomes easier to access when "+sc+". It is usually more effective when "+ss+", helping you "+sb+".</p>";
        s += "<p class='f34-copy' style='font-weight:600'>Use this intentionally when: "+ac+"</p>";
        return s;
      }
      // 27-34: SUPPORT STRATEGY
      var sc = th.supportCondition||""; var sp = th.supportPartner||""; var ss = th.supportStructure||""; var sb = th.supportBenefit||""; var pc = th.partnershipCue||"";
      var s = "<div class='f34-label'>SUPPORT STRATEGY</div>";
      s += "<p class='f34-copy'>This theme becomes easier to access when "+sc+". It usually works best when "+sp+", supported by "+ss+", so you can "+sb+".</p>";
      s += "<p class='f34-copy' style='font-weight:600'>Cover this lane best by: "+pc+".</p>";
      return s;
    }

    // Helper: closing line
    function closingLine(ri, th) {
      var im = th.investmentMove||"";
      if (ri<5) {
        var v = ["To deepen this strength","To sharpen this strength","To invest in this strength","To keep this strength sharp","To develop this strength further"];
        return v[ri]+": "+im+".";
      }
      if (ri<10) {
        var v6 = ["To get more out of this strength","To use this strength more deliberately","To strengthen this support theme","To refine this strength","To make this strength more intentional"];
        return v6[ri-5]+": "+im+".";
      }
      return ""; // lower sections use awareness cue instead
    }

    // Section definitions
    var sections = [
      {name:"The Top 5",sub:"Dominant",s:0,e:5,color:"#6D28D9",
       intro:"These are your most dominant strengths, the clearest patterns in how you naturally work, think, and contribute. This is where the greatest developmental value usually lives.",
       perPage:1},
      {name:"6\u201310",sub:"Supporting",s:5,e:10,color:"#2563EB",
       intro:"These are strong supporting strengths. They may not define you as clearly as your top five, but they show up often and add meaningful range to how you operate.",
       perPage:2},
      {name:"11\u201317",sub:"Available",s:10,e:17,color:"#0891B2",
       intro:"These strengths are present and available, but they are not primary lead patterns. You may draw on them in the right context, even if they are not your strongest defaults.",
       perPage:2},
      {name:"18\u201326",sub:"Situational",s:17,e:26,color:"#059669",
       intro:"These are less instinctive strengths. They are not weaknesses, just themes you are less likely to lead with naturally. You may still use them situationally or appreciate them more when others bring them into the room.",
       perPage:2},
      {name:"27\u201334",sub:"Least Dominant",s:26,e:34,color:"#9CA3AF",
       intro:"These are your least dominant themes. They are not flaws to fix. They are simply less central to how you naturally operate and are more likely to be supported through context, structure, or partnership than through instinct alone.",
       perPage:3}
    ];

    sections.forEach(function(sec) {
      // Section intro page
      html += "<div class='page page-break'>";
      html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>"+(name||"")+" &middot; "+sec.sub+"</span></div>";
      html += "<div style='display:flex;flex-direction:column;justify-content:center;min-height:60vh'>";
      html += "<div style='max-width:480px'>";
      html += "<div style='font-size:9pt;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:"+sec.color+";margin-bottom:8px'>Section</div>";
      html += "<h2 style='font-size:28pt;font-weight:800;margin-bottom:12px;color:#1a1a2e'>"+sec.name+" <span style='font-weight:400;color:"+sec.color+"'>"+sec.sub+"</span></h2>";
      html += "<p class='sec-body' style='font-size:11pt;line-height:1.7;color:#555'>"+sec.intro+"</p>";
      html += "</div></div></div>";

      // Theme entries
      var count = 0;
      for (var ti = sec.s; ti < Math.min(sec.e, ranked.length); ti++) {
        var t = ranked[ti]; var th = TH[t.id]; var col = dc(t.id);
        var isTop5 = ti < 5;

        // Page breaks: 1 per page for Top 5, 2 for middle, 2-3 for lower
        if (count % sec.perPage === 0) {
          if (count > 0) html += "</div>";
          html += "<div class='page page-break'>";
          html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>"+(name||"")+" &middot; "+sec.sub+"</span></div>";
        }

        html += "<div class='f34-theme'>";
        // Theme header: rank + name + domain
        html += "<div class='f34-hdr'>";
        html += "<div class='f34-rank' style='color:"+col+";font-size:"+(isTop5?"24pt":"20pt")+"'>"+(ti+1)+"</div>";
        html += "<div><div class='f34-name' style='font-size:"+(isTop5?"16pt":"14pt")+"'>"+th.n+"</div>";
        html += "<div class='f34-domain' style='color:"+col+"'>"+dn(t.id)+"</div></div></div>";

        // Subtle domain color bar
        html += "<hr class='theme-bar' style='background:"+col+";opacity:0.3'>";

        // Intro paragraph (rank-specific)
        html += "<p class='f34-copy' style='margin-bottom:8px'>"+rankIntro(ti, th)+"</p>";

        // Context line (thrive / available / low)
        html += "<p class='f34-copy' style='margin-bottom:10px;font-style:italic;color:#555'>"+contextLine(ti, th)+"</p>";

        // Core line
        html += "<p class='f34-copy' style='margin-bottom:12px'>"+coreLine(ti, th)+"</p>";

        // Special section (blind spots / watch for / underused advantage / works best when / support strategy)
        if (th.overuseTrigger1 || th.underuseAdvantage || th.supportCondition) {
          html += specialSection(ti, th);
        }

        // Closing line (Top 5 and Supporting only)
        var cl = closingLine(ti, th);
        if (cl) {
          html += "<p class='f34-copy' style='font-style:italic;color:#666;margin-top:8px'>"+cl+"</p>";
        }

        html += "</div>"; // end f34-theme
        count++;
      }
      html += "</div>"; // close last page of section
    });

    // --- 10. CLOSING PAGE ---
    html += "<div class='page page-break' style='display:flex;flex-direction:column;justify-content:center;min-height:100vh'>";
    html += "<h2 style='font-size:22pt;font-weight:800;margin-bottom:20px;text-align:center'>How to Use This Report</h2>";
    html += "<div style='max-width:500px;margin:0 auto'>";
    html += "<p class='sec-body' style='margin-bottom:14px;text-align:center'>This report is meant to help you understand the full shape of your strengths profile, not to turn every lower-ranked theme into a development project.</p>";
    html += "<p class='sec-body' style='margin-bottom:14px;text-align:center'>Your top themes are where you are most likely to find the greatest return from deeper reflection, stronger application, and more intentional development. The rest of your profile still matters, but not every theme needs equal attention.</p>";
    html += "<p class='sec-body' style='margin-bottom:14px;text-align:center'>Use this report to understand where you naturally lead, where you have supporting range, and where you may be more likely to rely on context, structure, or partnership. Use your Top 5 report for the deeper coaching and application work.</p>";
    html += "<div style='text-align:center;margin-top:32px'>";
    html += "<p style='font-size:10pt;color:#bbb'>Strengths Discovery &middot; "+(new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}))+"</p>";
    html += "</div></div></div>";
  }

  html += "</body></html>";

  // Render in iframe
  var frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:99999;background:#fff";
  document.body.appendChild(frame);
  var fdoc = frame.contentDocument || frame.contentWindow.document;
  fdoc.open();
  fdoc.write(html);
  fdoc.close();
  var closeBtn = fdoc.createElement("div");
  closeBtn.innerHTML = "\u2715 Close";
  closeBtn.className = "no-print";
  closeBtn.style.cssText = "position:fixed;top:12px;right:16px;background:#6D28D9;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;z-index:100;font-family:sans-serif";
  closeBtn.onclick = function() { document.body.removeChild(frame); };
  fdoc.body.appendChild(closeBtn);
  var printBtn = fdoc.createElement("div");
  printBtn.innerHTML = "\uD83D\uDDA8 Save as PDF";
  printBtn.className = "no-print";
  printBtn.style.cssText = "position:fixed;top:12px;right:120px;background:#1a1a2e;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;z-index:100;font-family:sans-serif";
  printBtn.onclick = function() { frame.contentWindow.print(); };
  fdoc.body.appendChild(printBtn);
}

/* ---- RESULTS ---- */
function ResultsScreen(props) {
  const [view, setView] = useState("top5");
  const [expSection, setExpSection] = useState({});
  const [expTheme, setExpTheme] = useState(null);
  const [confirmRetake, setConfirmRetake] = useState(false);
  var ranked = props.ranked;

  var byD = {};
  DO.forEach(function(d) {
    byD[d] = ranked.filter(function(t) { return TH[t.id].d === d; }).sort(function(a, b) { return b.score - a.score; });
  });
  var maxScore = ranked[0] ? ranked[0].score : 1;
  var da = DO.map(function(d) {
    var avg = Math.round(byD[d].reduce(function(s, t) { return s + t.score; }, 0) / byD[d].length);
    return { id: d, name: DOMAINS[d].name, color: DOMAINS[d].color, avg: avg };
  }).sort(function(a, b) { return b.avg - a.avg; });

  var top5 = ranked.slice(0, 5);

  function toggleSection(themeId, section) {
    var key = themeId + "-" + section;
    var next = {};
    Object.keys(expSection).forEach(function(k) { next[k] = expSection[k]; });
    next[key] = !next[key];
    setExpSection(next);
  }

  function SectionButton(sbProps) {
    var key = sbProps.themeId + "-" + sbProps.section;
    var isOpen = expSection[key];
    return (
      <div style={{ marginBottom: 6 }}>
        <button onClick={function(e) { e.stopPropagation(); toggleSection(sbProps.themeId, sbProps.section); }} style={{
          width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, border: "1px solid #e8e6f0",
          background: isOpen ? "#f3f0ff" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
          color: isOpen ? "#6D28D9" : "#1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{sbProps.label}</span>
          <span style={{ fontSize: 16, color: "#9999aa" }}>{isOpen ? "\u2212" : "+"}</span>
        </button>
        {isOpen && (
          <div style={{ padding: "12px 14px", fontSize: 13, lineHeight: 1.7, color: "#555570" }}>
            {sbProps.text}
          </div>
        )}
      </div>
    );
  }

  function Top5Card(cardProps) {
    var t = cardProps.t;
    var rk = cardProps.rank;
    var th = TH[t.id];
    var dc = DOMAINS[th.d].color;
    var ins = props.insights && props.insights.themes ? props.insights.themes[t.id] : null;
    return (
      <div style={{ marginBottom: 16, borderRadius: 14, border: "1px solid #e8e6f0", overflow: "hidden", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 18px 14px", borderBottom: "1px solid #e8e6f0", background: "#f8f7fc" }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: dc, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>{rk}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>{th.n}</div>
            <div style={{ fontSize: 12, color: dc, fontWeight: 500 }}>{DOMAINS[th.d].name}</div>
          </div>
        </div>
        <div style={{ padding: "14px 18px 6px" }}>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#555570", margin: "0 0 14px" }}>{th.desc}</p>
          {ins && ins.unique && (
            <div style={{ marginBottom: 10, padding: "12px 14px", borderRadius: 8, background: "#f3f0ff", border: "1px solid #e8e0ff" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6D28D9", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Why Your {th.n} Is Unique</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: "#555570" }}>{ins.unique}</div>
            </div>
          )}
          <SectionButton themeId={t.id} section="atWork" label="At Work" text={th.atWork} />
          <SectionButton themeId={t.id} section="atBest" label="At Your Best" text={th.atBest} />
          <SectionButton themeId={t.id} section="leanIn" label="How to Lean In" text={th.leanIn} />
          {th.blindSpots && th.blindSpots.length > 0 && (
            <SectionButton themeId={t.id} section="blindSpots" label="Watch Out" text={th.blindSpots.join(" ")} />
          )}
        </div>
      </div>
    );
  }

  function SmallCard(cardProps) {
    var t = cardProps.t;
    var th = TH[t.id];
    var dc = DOMAINS[th.d].color;
    var rk = ranked.indexOf(t) + 1;
    var isE = expTheme === t.id;
    var barWidth = maxScore > 0 ? Math.max((t.score / maxScore) * 100, 2) : 2;
    return (
      <div onClick={function() { setExpTheme(isE ? null : t.id); }} style={{ padding: "12px 14px", marginBottom: 5, borderRadius: 10, background: "#f8f7fc", border: "1px solid #e8e6f0", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: rk <= 5 ? dc : rk <= 10 ? dc + "33" : "#e8e6f0", color: rk <= 5 ? "#fff" : rk <= 10 ? dc : "#9999aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{rk}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{th.n} <span style={{ fontSize: 11, color: dc, fontWeight: 400 }}>{DOMAINS[th.d].name}</span></div>
            <div style={{ height: 3, background: "#e8e6f0", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: barWidth + "%", background: dc, borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: dc, flexShrink: 0 }}>{t.score}</div>
        </div>
        {isE && <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #e8e6f0", fontSize: 13, lineHeight: 1.6, color: "#555570" }}>{th.desc}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px", background: "#fff", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#6D28D9", marginBottom: 10, fontWeight: 600 }}>Your Results</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{props.name ? props.name + "\u2019s" : "Your"} Strengths Profile</h1>
      </div>

      {props.pin && (
        <div style={{ textAlign: "center", marginBottom: 20, padding: "14px 20px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <p style={{ fontSize: 13, color: "#166534", fontWeight: 600, margin: "0 0 4px" }}>Your Results PIN</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#166534", letterSpacing: 6, margin: "0 0 4px", fontFamily: "monospace" }}>{props.pin}</p>
          <p style={{ fontSize: 11, color: "#15803d", margin: 0 }}>Save this PIN to access your results later with your email.</p>
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: 28, padding: "16px 20px", borderRadius: 12, background: da[0].color + "14", border: "1px solid " + da[0].color + "33" }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: da[0].color, marginBottom: 3, fontWeight: 600 }}>Dominant Domain</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: da[0].color }}>{da[0].name}</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 32, flexWrap: "wrap" }}>
        {da.map(function(d) {
          return (
            <div key={d.id} style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 8, background: "#f8f7fc", border: "1px solid #e8e6f0", textAlign: "center" }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: d.color, margin: "0 auto 5px" }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: "#1a1a2e" }}>{d.name}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: d.color, marginTop: 2 }}>{d.avg}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 24, background: "#f8f7fc", borderRadius: 7, padding: 3, border: "1px solid #e8e6f0" }}>
        {[{ id: "top5", l: "Top 5" }, { id: "full", l: "Full 34" }, { id: "domains", l: "By Domain" }].map(function(tab) {
          return (
            <button key={tab.id} onClick={function() { setView(tab.id); }} style={{ flex: 1, padding: 9, borderRadius: 5, border: "none", background: view === tab.id ? "#6D28D9" : "transparent", color: view === tab.id ? "#fff" : "#555570", fontSize: 13, fontWeight: view === tab.id ? 600 : 400, cursor: "pointer" }}>{tab.l}</button>
          );
        })}
      </div>

      {view === "top5" && (
        <div>
          <p style={{ fontSize: 13, color: "#9999aa", marginBottom: 16, textAlign: "center" }}>Tap each section to learn how this strength shows up for you.</p>
          {top5.map(function(t, i) { return <Top5Card key={t.id} t={t} rank={i + 1} />; })}
        </div>
      )}

      {view === "full" && ranked.map(function(t) { return <SmallCard key={t.id} t={t} />; })}

      {view === "domains" && DO.map(function(d) {
        return (
          <div key={d} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: DOMAINS[d].color }} />
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: 0 }}>{DOMAINS[d].name}</h2>
            </div>
            {byD[d].map(function(t) { return <SmallCard key={t.id} t={t} />; })}
          </div>
        );
      })}

      <div style={{ textAlign: "center", marginTop: 36, paddingTop: 24, borderTop: "1px solid #e8e6f0" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>Share Your Strengths</p>
        <p style={{ fontSize: 13, color: "#9999aa", marginBottom: 0 }}>Screenshot this card and share it with your team.</p>
        <ShareCard ranked={ranked} name={props.name} />
      </div>

      <div style={{ textAlign: "center", marginTop: 24, padding: "20px 24px", borderRadius: 12, background: "#f8f7fc", border: "1px solid #e8e6f0" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>Download Your Reports</p>
        <p style={{ fontSize: 13, color: "#9999aa", marginBottom: 14 }}>Save as PDF from the print dialog that opens.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={function() { printReport("top5", ranked, props.name, props.insights); }} style={{ padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "#6D28D9", color: "#fff", fontSize: 14, fontWeight: 600 }}>Top 5 Report</button>
          <button onClick={function() { printReport("full34", ranked, props.name, props.insights); }} style={{ padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "#6D28D9", color: "#fff", fontSize: 14, fontWeight: 600 }}>Full 34 Report</button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 24, padding: "20px 24px", borderRadius: 12, background: "#f8f7fc", border: "1px solid #e8e6f0" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>Email Your Results</p>
        <p style={{ fontSize: 13, color: "#9999aa", marginBottom: 14 }}>Send yourself a summary of your top 5 strengths.</p>
        <button onClick={function() {
          var top5 = ranked.slice(0, 5);
          var subject = encodeURIComponent((props.name || "My") + " Strengths Discovery Results");
          var body = (props.name || "Hi") + "'s Top 5 Strengths\n\n";
          top5.forEach(function(t, i) {
            var th = TH[t.id];
            var ins = props.insights && props.insights.themes ? props.insights.themes[t.id] : null;
            body += (i + 1) + ". " + th.n + " (" + DOMAINS[th.d].name + ")\n" + th.desc + "\n\n";
            if (ins && ins.unique) body += "WHY YOUR " + th.n.toUpperCase() + " IS UNIQUE: " + ins.unique + "\n\n";
            if (th.atWork) body += "AT WORK: " + th.atWork + "\n\n";
            if (th.atBest) body += "AT YOUR BEST: " + th.atBest + "\n\n";
            if (th.leanIn) body += "HOW TO LEAN IN: " + th.leanIn + "\n\n";
            if (th.blindSpots && th.blindSpots.length > 0) body += "WATCH OUT: " + th.blindSpots[0] + "\n\n";
            body += "---\n\n";
          });
          body += "Full ranking:\n";
          ranked.forEach(function(t, i) { body += (i + 1) + ". " + TH[t.id].n + "\n"; });
          window.open("mailto:?subject=" + subject + "&body=" + encodeURIComponent(body));
        }} style={{ padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer", background: "#6D28D9", color: "#fff", fontSize: 14, fontWeight: 600 }}>Email My Results</button>
      </div>

      <div style={{ textAlign: "center", marginTop: 16, padding: "20px 24px", borderRadius: 12, background: "#f8f7fc", border: "1px solid #e8e6f0" }}>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#555570", margin: "0 0 12px" }}>Your results are saved. Come back anytime and enter your email to see them again.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={props.onReveal} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e8e6f0", cursor: "pointer", background: "#6D28D9", color: "#fff", fontSize: 14 }}>View Reveal Again</button>
          {!confirmRetake && (
            <button onClick={function() { setConfirmRetake(true); }} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e8e6f0", cursor: "pointer", background: "#fff", color: "#555570", fontSize: 14 }}>Retake Assessment</button>
          )}
        </div>
        {confirmRetake && (
          <div style={{ marginTop: 12, padding: "16px 20px", borderRadius: 10, background: "#fff4e5", border: "1px solid #fde68a" }}>
            <p style={{ fontSize: 13, color: "#92400e", margin: "0 0 10px", lineHeight: 1.5 }}>This will erase your current results and start over. Are you sure?</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={props.onRetake} style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "#DC2626", color: "#fff", fontSize: 13, fontWeight: 600 }}>Yes, start over</button>
              <button onClick={function() { setConfirmRetake(false); }} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #e8e6f0", cursor: "pointer", background: "#fff", color: "#555570", fontSize: 13 }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- GENERATE INSIGHTS VIA CLAUDE API ---- */
async function generateInsights(ranked, name) {
  var top5 = ranked.slice(0, 5);
  var top10 = ranked.slice(0, 10);
  var t5names = top5.map(function(t) { return TH[t.id].n; });
  var t5domains = top5.map(function(t) { return DOMAINS[TH[t.id].d].name; });
  var t10names = top10.map(function(t) { return TH[t.id].n; });

  var bottom5 = ranked.slice(-5);
  var b5names = bottom5.map(function(t) { return TH[t.id].n; });

  var prompt = "You are an elite strengths coach writing personalized insights for a strengths assessment. The person's name is " + (name || "this person") + ".\n\n" +
    "Their top 5 strengths in order: " + t5names.join(", ") + "\n" +
    "Their domains: " + t5domains.join(", ") + "\n" +
    "Their top 10: " + t10names.join(", ") + "\n" +
    "Their bottom 5 (least dominant): " + b5names.join(", ") + "\n\n" +
    "Generate a JSON object with NO other text, no markdown backticks, no preamble. Just raw JSON.\n\n" +
    "The JSON should have this structure:\n" +
    "{\n" +
    '  "themes": {\n' +
    '    "<theme_key>": {\n' +
    '      "unique": "A substantial paragraph (5-6 sentences) explaining why THIS person\'s version of this strength is unique given their specific top 5 combination. Reference how their other strengths interact with this one. Be deeply specific and personalized. Write in second person. Use openers like By nature, Instinctively, Because of your strengths, Driven by your talents, Chances are good that."\n' +
    "    }\n" +
    "  },\n" +
    '  "blends": [\n' +
    '    { "a": "<theme1_key>", "b": "<theme2_key>", "text": "One punchy sentence about how these two strengths interact.", "detail": "2-3 sentences expanding on this combination." }\n' +
    "  ],\n" +
    '  "summary": "One sentence that captures this person\'s entire operating style based on all 5. Direct, memorable, no fluff. Like a brand statement.",\n' +
    '  "fullProfile": "A 3-4 sentence paragraph painting a vivid picture of who this person is at their best. Reference their specific top 5 by name. Write in third person using their name.",\n' +
    '  "blindSpotProfile": "2-3 sentences about their overall blind spot pattern based on the COMBINATION of their top 5 and bottom 5. What situations might drain them? Write in second person.",\n' +
    '  "dominantDomain": "2-3 sentences about what their domain mix means for how they contribute to teams. Reference the specific domain names and what the clustering suggests.",\n' +
    '  "full34Interpretation": "A 4-6 sentence paragraph synthesizing the OVERALL shape of the full 34 profile. Go beyond the top 5. Comment on: where the strongest concentration patterns are, any notable contrasts or tensions across the full profile (e.g. top themes are all Relationship Building but bottom themes are all Executing), what stands out about the overall wiring. Be direct, insightful, work-focused, and specific. Do not repeat the top themes one by one. Write in second person.",\n' +
    '  "full34DomainMix": "2-3 sentences specifically about the domain distribution across all 34 themes. Comment on whether one or two domains dominate, whether the profile is balanced, whether the top clusters differently from the full 34, and what that suggests about how this person approaches work, decision-making, and collaboration. Be specific and use the actual domain counts."\n' +
    "}\n\n" +
    "INSTRUCTIONS:\n" +
    "1. Theme keys for top 5 only: " + top5.map(function(t) { return t.id; }).join(", ") + "\n" +
    "2. Generate all 10 pairwise blend combinations of the top 5.\n" +
    "3. Every insight must reference their SPECIFIC combination. No generic descriptions.\n" +
    "4. Tone: direct, insightful, work-focused, warm but not cheesy. Like an elite coach who knows them.\n" +
    "5. ONLY output valid JSON. No backticks, no explanation.\n" +
    "6. Full 34 ranking (for full34Interpretation and full34DomainMix): " + ranked.map(function(t,i) { return (i+1)+"."+TH[t.id].n+"("+DOMAINS[TH[t.id].d].name+")"; }).join(", ");

  try {
    var response = await fetch("/.netlify/functions/generate-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt }),
    });
    if (!response.ok) { console.error("Insights API error:", response.status); return null; }
    var data = await response.json();
    var text = data.content.map(function(c) { return c.text || ""; }).join("");
    var clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("Insights generation failed:", e);
    return null;
  }
}

/* ---- GENERATING SCREEN ---- */
function GeneratingScreen(props) {
  const [dots, setDots] = useState("");
  useEffect(function() {
    var i = setInterval(function() { setDots(function(d) { return d.length >= 3 ? "" : d + "."; }); }, 500);
    return function() { clearInterval(i); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "linear-gradient(160deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 60%)", filter: "blur(80px)" }} />
      <div style={{ position: "relative", textAlign: "center", padding: "0 32px" }}>
        <div style={{ width: 48, height: 48, border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #6D28D9", borderRadius: "50%", margin: "0 auto 24px", animation: "spin 1s linear infinite" }} />
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Analyzing your strengths{dots}</div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>We're generating personalized insights based on your unique combination.</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ---- MAIN APP ---- */
export default function Quiz() {
  const [screen, setScreen] = useState("welcome");
  const [answers, setAnswers] = useState([]);
  const [queue, setQueue] = useState([]);
  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState("core");
  const [ranked, setRanked] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [insights, setInsights] = useState(null);
  const [userPin, setUserPin] = useState(null);

  var coreQ = useMemo(function() {
    return shuffle(Array.from({ length: 90 }, function(_, i) { return i; }));
  }, []);

  useEffect(function() { setQueue(coreQ); }, [coreQ]);

  useEffect(function() {
    if (screen === "quiz" && userEmail) {
      saveData(userEmail, { answers: answers, queue: queue, qi: qi, phase: phase, name: userName });
    }
  }, [answers, qi, screen, queue, phase, userEmail, userName]);

  function goToReveal(sc, nm) {
    setScreen("generating");
    generateInsights(sc, nm).then(function(ins) {
      setInsights(ins);
      setScreen("reveal");
    });
  }

  function handleStart(resume, email, name) {
    setUserEmail(email);
    setUserName(name);
    if (resume) {
      var s = loadData(email);
      if (s && s.answers && s.answers.length > 0) {
        setAnswers(s.answers);
        if (s.completed && s.ranked) {
          setRanked(s.ranked);
          if (s.insights) { setInsights(s.insights); setScreen("results"); }
          else { goToReveal(s.ranked, s.name || name); }
          return;
        }
        setQueue(s.queue || coreQ);
        setQi(s.qi || 0);
        setPhase(s.phase || "core");
        setScreen("quiz");
      } else { setQueue(coreQ); setScreen("quiz"); }
    } else {
      setAnswers([]); setQueue(coreQ); setQi(0); setPhase("core"); clearData(email); setScreen("quiz");
    }
  }

  function handlePick(qIndex, val) {
    var na = answers.concat([{ qi: qIndex, val: val }]);
    setAnswers(na);
    var nqi = qi + 1;
    if (nqi < queue.length) { setQi(nqi); }
    else {
      var sc = calcScores(na);
      var nb = getNextBatch(na, sc);
      if (nb.length === 0 || na.length >= 200) {
        setRanked(sc);
        saveData(userEmail, { answers: na, ranked: sc, completed: true, name: userName });
        submitToSupabase(userEmail, userName, sc).then(function(pin) { if (pin) setUserPin(pin); });
        goToReveal(sc, userName);
      } else {
        setPhase("adaptive"); var nq = queue.concat(nb); setQueue(nq); setQi(queue.length);
      }
    }
  }

  function handleRetake() {
    setAnswers([]); setRanked(null); setInsights(null); setQueue(coreQ); setQi(0); setPhase("core"); clearData(userEmail); setScreen("welcome");
  }

  function finishReveal() {
    if (userEmail && ranked) {
      saveData(userEmail, { answers: answers, ranked: ranked, completed: true, name: userName, insights: insights });
    }
    setScreen("results");
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#1a1a2e", background: "#fff", colorScheme: "light" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {screen === "welcome" && <Welcome onStart={handleStart} onTestResults={function(r, n) { setRanked(r); setUserName(n); goToReveal(r, n); }} onImport={function(r, n, e) { setRanked(r); setUserName(n); setUserEmail(e); if (e) saveData(e, { answers: [], ranked: r, completed: true, name: n }); goToReveal(r, n); }} />}
      {screen === "quiz" && <QuizScreen queue={queue} qi={qi} answers={answers} onPick={handlePick} phase={phase} onExit={function() { setScreen("welcome"); }} />}
      {screen === "generating" && <GeneratingScreen />}
      {screen === "reveal" && ranked && <RevealScreen ranked={ranked} name={userName} totalQ={answers.length} insights={insights} onFinish={finishReveal} />}
      {screen === "results" && ranked && <ResultsScreen ranked={ranked} onRetake={handleRetake} onReveal={function() { setScreen("reveal"); }} name={userName} insights={insights} pin={userPin} />}
    </div>
  );
}
