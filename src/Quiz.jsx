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
    atWork: "You are the engine. You take on more than your share, stay late, come in early. When there is a gap in capacity, you fill it before anyone asks. Your output is consistently higher than your peers and you set the pace for what productivity looks like.",
    atBest: "You create momentum on every account you touch. People trust you to deliver because you always do. Your energy is contagious and your work ethic gives the team confidence that things will get done.",
    leanIn: "Track your wins visibly, not just for recognition but so you can see the patterns in where your drive produces the most impact. Volunteer for the high-output, high-stakes moments where your stamina gives the team an edge. Set stretch goals for yourself and share them with your manager so they can point your engine at the right targets." },
  arranger: { n: "Arranger", d: "executing", desc: "You can organize, but you also have flexibility. You figure out how all the pieces can be arranged for maximum productivity.",
    atWork: "You see the whole board. When there are multiple clients, competing deadlines, and shifting priorities, you instinctively rearrange the pieces to make it work. You think in configurations, not just task lists.",
    atBest: "You bring calm to chaos. You make the complex feel manageable. You find combinations of people and resources that others would not have seen, and you do it fast enough that the team barely notices the complexity you just absorbed.",
    leanIn: "Seek out the most operationally complex accounts and projects. Ask to be involved in staffing conversations and project planning, because your ability to see how the pieces fit is one of the firm's biggest assets. When things change, lean into the reconfiguration rather than resisting it. That is where you shine." },
  belief: { n: "Belief", d: "executing", desc: "You have core values that are enduring. Out of these values emerges a defined purpose for your life.",
    atWork: "You are the moral compass. You care deeply about whether the work matters, not just whether it ships. You bring a sense of purpose that anchors the team during long stretches and tough cycles.",
    atBest: "Your values give you clarity when everything else is ambiguous. You make decisions quickly because your compass is always pointing the same direction. People trust you because they know exactly where you stand, and that consistency is rare.",
    leanIn: "Actively connect the work to the mission, out loud, for other people. When you feel energized by a project, name why. When something feels misaligned, say so early rather than letting it build. Your values are your superpower, so make them visible to the team rather than carrying them quietly." },
  consistency: { n: "Consistency", d: "executing", desc: "You are keenly aware of the need to treat people the same. You crave stable routines and clear rules.",
    atWork: "You make sure the rules are applied fairly. You build processes, standardize templates, and advocate for equal treatment. You notice when someone is getting a different deal, and you ask why.",
    atBest: "You create fairness and predictability. People know what to expect from you and from the systems you build. Teams run better because of the structures you put in place, and people feel safe because they know the ground rules are stable.",
    leanIn: "Own the systems. Volunteer to build the SOPs, the onboarding processes, the internal playbooks. Position yourself as the person who ensures quality and fairness across accounts. When you see inconsistencies, frame your observations as opportunities to improve rather than complaints." },
  deliberative: { n: "Deliberative", d: "executing", desc: "You take serious care in making decisions. You anticipate obstacles and think through what could go wrong.",
    atWork: "You are the risk spotter. Before the team commits to a strategy, you have already thought through what could go wrong. You are careful with sensitive information, selective about trust, and thorough in your thinking.",
    atBest: "You protect the team from avoidable mistakes. You ask the questions no one else is asking. In high-stakes environments where one wrong move can be costly, your caution is one of the firm's most valuable assets.",
    leanIn: "Position yourself as the person who pressure-tests strategies before they go to the client. Offer to do the risk review, the compliance check, the 'what could go wrong' pass. Your thoroughness is not slowness, it is quality assurance. Make that role explicit rather than informal." },
  discipline: { n: "Discipline", d: "executing", desc: "You enjoy routine and structure. Your world is best described by the order you create.",
    atWork: "You are the most organized person in the room. Your files are named correctly, your calendar is tight, your processes are documented. When shared systems fall apart, you are the one who notices and fixes them.",
    atBest: "You create the structure that lets everyone else do their best work. You reduce friction, eliminate confusion, and make the invisible work of organization visible. Things do not fall through the cracks on your watch.",
    leanIn: "Build systems for the team, not just yourself. Your organizational skills scale beautifully when you turn them outward. Offer to own the project management tools, the file structures, the status update cadences. The more of the firm's infrastructure runs through your systems, the more indispensable you become." },
  focus: { n: "Focus", d: "executing", desc: "You can take a direction, follow through, and stay on track. You prioritize, then act.",
    atWork: "You keep the team on track. When conversations drift, you bring them back. When priorities multiply, you cut through to the one that matters most. You are disciplined about where you spend your time and protective of your attention.",
    atBest: "You accomplish more than people who work longer hours because every minute is pointed at the goal. You help teams avoid scope creep and stay oriented toward outcomes. Your clarity of purpose is a gift to every project you touch.",
    leanIn: "Be the person who names the priority. In kickoff meetings, in strategy sessions, in Slack threads that are drifting, be the one who says 'the one thing that matters here is...' That instinct is incredibly valuable and most people do not have it. Also, protect your focused time aggressively, because that is where your best work happens." },
  responsibility: { n: "Responsibility", d: "executing", desc: "You take psychological ownership of what you say you will do. You are committed to honesty and loyalty.",
    atWork: "You are the person everyone trusts with the high-stakes deliverable. When you say you will do something, it is done. You take ownership psychologically, not just operationally.",
    atBest: "You are the most reliable person in the building. Clients trust you. Partners trust you. Your word is your bond, and that creates a foundation of confidence for the entire team.",
    leanIn: "Let your reliability become your brand. Take on the commitments that matter most, the ones where follow-through is critical. Be selective about what you commit to so that everything you do touch gets your full attention. Your track record of delivery is one of the most valuable currencies in consulting. Spend it wisely." },
  restorative: { n: "Restorative", d: "executing", desc: "You are adept at dealing with problems. You are good at figuring out what is wrong and resolving it.",
    atWork: "You are the fixer. When a project is off the rails, a process is broken, or a client relationship is strained, you dig in. You diagnose problems quickly and you do not rest until the issue is resolved.",
    atBest: "You turn crises into comebacks. You see opportunity where others see failure. Your ability to diagnose and resolve makes you the person everyone wants in the room when things go wrong.",
    leanIn: "Volunteer for the turnaround assignments. The struggling account, the broken process, the campaign that needs saving. That is where your energy comes alive. Also, apply your diagnostic skills proactively, not just in crisis mode. Audit systems and processes before they break." },
  activator: { n: "Activator", d: "influencing", desc: "You make things happen by turning thoughts into action. You want to do things now, not just talk about them.",
    atWork: "You turn talk into action. While others are still debating the plan, you have already taken the first step. You create momentum and you believe that clarity comes from doing, not from planning.",
    atBest: "Projects start because of you. Teams move because of you. Your bias toward action prevents the firm from getting stuck in analysis paralysis and your energy is genuinely contagious.",
    leanIn: "Be the person who says 'I will take the first step on this' at the end of every meeting. Your willingness to initiate is rare and extremely valuable. Pair yourself intentionally with people who are strong finishers so that what you start gets completed at the same quality you initiated it with." },
  command: { n: "Command", d: "influencing", desc: "You have presence. You can take control of a situation and make decisions. You are not afraid of confrontation.",
    atWork: "You take charge. In a crisis, in a stakeholder meeting, in a moment of indecision, you step forward and say what needs to happen. You are comfortable with confrontation and you do not shy away from difficulty.",
    atBest: "You bring clarity and direction when everyone else is frozen. You name the thing nobody else will say. You make decisions when decisions need to be made, and people feel safer because someone is driving.",
    leanIn: "Step into leadership moments explicitly. When a situation needs someone to take charge, do not wait to be asked. Also, use your presence to create space for others to speak up, because your ability to hold a room is just as powerful when you use it to elevate other voices as when you use it to direct." },
  communication: { n: "Communication", d: "influencing", desc: "You find it easy to put thoughts into words. You are a good conversationalist and presenter.",
    atWork: "You are the storyteller. You make complex ideas simple, dry material engaging, and client presentations memorable. You think in narratives and you instinctively know how to frame a message for any audience.",
    atBest: "You are the voice of the team. You bring ideas to life in a way that moves people. Your ability to frame, narrate, and present makes the firm's work shine and makes other people's good work visible.",
    leanIn: "Volunteer for the high-visibility communications moments. The client presentation, the press strategy, the internal all-hands. Also, offer your framing skills to colleagues who have strong ideas but struggle to articulate them. Your ability to make other people's work compelling is one of the most generous applications of this strength." },
  competition: { n: "Competition", d: "influencing", desc: "You measure your progress against others. You strive to win first place and revel in contests.",
    atWork: "You are aware of the scoreboard at all times. You know how your numbers compare to your peers, how your team stacks up against other firms, and where you rank. This awareness pushes you to work harder and produce more.",
    atBest: "You raise the bar for everyone. Your drive to be the best is infectious and your intensity elevates team performance. You celebrate wins and you hate losing in a way that keeps the team hungry and ambitious.",
    leanIn: "Channel your competitive energy toward external benchmarks. How does the firm stack up against competitors? How does your account's performance compare to industry standards? When you frame competition as the team versus the world rather than you versus your colleagues, everyone benefits from your intensity." },
  maximizer: { n: "Maximizer", d: "influencing", desc: "You focus on strengths to stimulate excellence. You seek to transform something strong into something superb.",
    atWork: "You take good work and make it great. You push for one more round of edits. You refine the strategy until it is sharp. You see potential in people and deliverables and you cannot rest until that potential is realized.",
    atBest: "You produce exceptional quality. You elevate everything you touch. You help people see what they are already good at and push them to develop those strengths further. You set a standard of excellence that raises the whole team.",
    leanIn: "Apply your eye for excellence to the firm's most visible work. Position yourself as the quality bar. Also, turn your Maximizer lens on people, not just deliverables. When you notice what a colleague does well and tell them, you accelerate their growth in a way that most feedback never achieves." },
  self_assurance: { n: "Self-Assurance", d: "influencing", desc: "You feel confident in your ability to take risks and manage your own life. You have an inner compass.",
    atWork: "You trust yourself. You make decisions confidently, take risks without excessive deliberation, and navigate ambiguity with a steadiness that others rely on. You do not need external validation to feel certain.",
    atBest: "You are an anchor. In uncertain moments, your confidence is calming. You make calls when others hesitate. You take on challenges that would intimidate others because you trust your ability to handle whatever comes.",
    leanIn: "Step into the situations that others are afraid of. The ambiguous client relationship, the high-stakes negotiation, the strategy call with incomplete information. Your confidence is most valuable in the moments where everyone else feels uncertain. Also, share your reasoning out loud so others can learn from the internal compass that guides you." },
  significance: { n: "Significance", d: "influencing", desc: "You want to make a big impact. You prioritize projects based on how much influence they will have.",
    atWork: "You want to make a visible impact. You are drawn to high-profile projects, leadership roles, and work that will be remembered. You are independent and you prioritize based on how much influence the work will have.",
    atBest: "You do transformative work. You aim higher than others and you pull the team toward ambitious goals. Your desire for impact drives you to produce work that actually moves the needle, not just fills a slot.",
    leanIn: "Seek out the projects that will define the firm's reputation. Pitch ideas that are bigger than what the client asked for. Your ambition is an asset when it is channeled toward outcomes that benefit the whole team. Also, document your impact. Build a track record that speaks for itself, because that is the legacy you are wired to create." },
  woo: { n: "Woo", d: "influencing", desc: "You love the challenge of meeting new people and winning them over. You derive satisfaction from breaking the ice.",
    atWork: "You are the relationship opener. You work a room, win over a new client on the first call, and make people feel comfortable immediately. You thrive on meeting new people and you are energized by the spark of a new connection.",
    atBest: "You open doors that others cannot. You build the firm's network, make introductions, and create warmth wherever you go. People want to work with the firm because they want to work with you.",
    leanIn: "Be the firm's front door. Volunteer for new business pitches, networking events, and client onboarding. Your gift for first impressions is one of the most commercially valuable strengths in consulting. Also, intentionally introduce people in your network to each other, because your ability to connect people creates value that compounds over time." },
  adaptability: { n: "Adaptability", d: "relationship_building", desc: "You prefer to go with the flow. You take things as they come and discover the future one day at a time.",
    atWork: "You do not flinch when the plan changes. You take things as they come, adjust on the fly, and stay calm when everyone else is stressed about the pivot. You live in the present and respond to what is in front of you.",
    atBest: "You are the team's shock absorber. You keep things moving when plans fall apart. You respond to client fire drills without drama. Your flexibility makes you invaluable in an environment where the only constant is change.",
    leanIn: "Position yourself as the go-to person for rapid response and evolving situations. When a new fire drill comes in, raise your hand. Also, help your less adaptable colleagues navigate change by modeling what calm flexibility looks like. Your composure during chaos is a leadership quality even when you do not have the title." },
  connectedness: { n: "Connectedness", d: "relationship_building", desc: "You have faith in the links among all things. You believe there are few coincidences.",
    atWork: "You see the bigger picture. You believe that events, people, and outcomes are all linked. You bring a sense of meaning and purpose to the team by helping others see how their individual work connects to something larger.",
    atBest: "You are a bridge builder. You help people from different backgrounds find common ground. You bring stability during difficult times because you have faith in a larger purpose. You give the team's work meaning beyond the deliverable.",
    leanIn: "Be the person who tells the story of why the work matters. In team meetings, in client conversations, in moments of doubt, connect the dots out loud. Your ability to see the larger web is not just philosophical, it is strategic. It helps teams make better decisions when they can see how the pieces fit together." },
  developer: { n: "Developer", d: "relationship_building", desc: "You recognize and cultivate the potential in others. You spot signs of improvement and derive satisfaction from progress.",
    atWork: "You are the coach. You notice when someone asks a better question in a meeting or writes a sharper memo. You invest time in people who are struggling because you can see their potential. You measure your own success partly by how much the people around you have grown.",
    atBest: "Your team members grow faster under your guidance because you see their potential before they do. You create an environment where people feel safe to learn and stretch. The firm's talent pipeline is stronger because of you.",
    leanIn: "Ask for formal mentoring relationships. Volunteer to onboard new hires. Sit in on work reviews and offer developmental feedback, not just evaluative feedback. Your ability to grow people is one of the highest-leverage things you can do for the firm, because every person you develop becomes a better contributor to every account they touch." },
  empathy: { n: "Empathy", d: "relationship_building", desc: "You can sense other people's feelings by imagining yourself in their lives or situations.",
    atWork: "You feel the room. You pick up on the anxiety behind a calm question, the frustration behind a polite email, the excitement someone is trying to hide. You instinctively understand emotional dynamics and use that understanding to navigate relationships.",
    atBest: "You are the team's emotional intelligence. You help leaders understand how decisions will land. You defuse tension before it becomes conflict. You make people feel seen and understood, which builds the kind of loyalty that holds teams together.",
    leanIn: "Use your emotional reads strategically. Before a tough client conversation, share what you are sensing with the team lead. In stakeholder meetings, read the room and signal what you are picking up. Also, offer to be a sounding board for colleagues who are navigating a difficult relationship. Your ability to understand how someone is feeling is a form of intelligence that most people do not have." },
  harmony: { n: "Harmony", d: "relationship_building", desc: "You look for consensus. You seek areas of agreement. Friction wastes time.",
    atWork: "You are the consensus builder. You find common ground between people who seem to disagree. You redirect unproductive arguments toward solutions. You believe that alignment moves things forward faster than conflict.",
    atBest: "You make teams functional. You reduce friction, bridge divides, and create environments where people can actually work together. You are the reason coalition partners stay at the table and stakeholder groups do not fall apart.",
    leanIn: "Volunteer for coalition work, multi-stakeholder processes, and any situation where people need to find common ground. That is your superpower. Also, when you find the overlap between two sides, name it explicitly and build the strategy around it. Your ability to see agreement where others see disagreement is incredibly valuable in politics and public affairs." },
  includer: { n: "Includer", d: "relationship_building", desc: "You accept others. You show awareness of those who feel left out and make an effort to include them.",
    atWork: "You notice who is missing. In a meeting, you see whose voice has not been heard. In a coalition, you think about which communities are not at the table. You actively work to pull people in.",
    atBest: "You create belonging. New team members feel welcomed because of you. Overlooked perspectives get heard because of you. The firm's work is more representative and more effective because you ensure no one is left out.",
    leanIn: "Make inclusion systematic, not just instinctive. Propose changes to processes that leave people out. Build check-in points where underrepresented voices get space. Also, help the team see inclusion not as a nice-to-have but as a strategic advantage, because broader input genuinely produces better outcomes." },
  individualization: { n: "Individualization", d: "relationship_building", desc: "You are intrigued with the unique qualities of each person. You figure out how different people can work together.",
    atWork: "You see each person as a unique case. You know what motivates one colleague versus another, how one client likes to receive information versus another, and which team member will thrive in which role.",
    atBest: "You are the ultimate relationship manager. You get the best out of people because you know how each person works. You match people to roles, tailor communications, and build teams that have chemistry because you understand the individual pieces.",
    leanIn: "Share your reads with leadership. When you notice that a colleague would thrive in a different role, say so. When you know a client needs information delivered a certain way, brief the team. Your observations about individuals are strategic intelligence that most people do not have. Make them visible." },
  positivity: { n: "Positivity", d: "relationship_building", desc: "You have contagious enthusiasm. You are upbeat and can get others excited about what they are going to do.",
    atWork: "You bring energy. You celebrate wins, you find the silver lining in setbacks, and you make the team environment a place where people actually want to show up. Your enthusiasm is genuine and contagious.",
    atBest: "You are the antidote to burnout. During long campaign stretches and high-stress client periods, your energy keeps the team going. You help people remember why the work matters and why they are good at it.",
    leanIn: "Be intentional about celebrations. When the team hits a milestone, make it visible. When a colleague does good work, name it. Also, your positivity is most powerful when it is specific. 'Great job' is nice. 'The way you handled that client call was exactly what they needed' is transformational." },
  relator: { n: "Relator", d: "relationship_building", desc: "You enjoy close relationships. You find deep satisfaction in working hard with friends to achieve a goal.",
    atWork: "You invest deeply in the people you work with. You prefer a few close, trusted relationships over a large network. Your working relationships feel like genuine friendships and you do your best work alongside people you trust.",
    atBest: "You build the deepest trust on the team. People confide in you. You create partnerships that endure across multiple campaigns and cycles. Your loyalty and reliability make you the person people want on their account.",
    leanIn: "Invest in the relationships that matter most strategically. Deepen your connection with the people you work with most closely, because that trust translates directly into better collaboration, better communication, and better outcomes. Also, be open about the fact that you work best with people you know well. That self-awareness helps managers put you in the right situations." },
  analytical: { n: "Analytical", d: "strategic_thinking", desc: "You search for reasons and causes. You think about all the factors that might affect a situation.",
    atWork: "You are the person who asks 'what is the evidence?' You challenge assumptions, dig into data, and do not accept claims at face value. You bring rigor to every strategy, recommendation, and deliverable.",
    atBest: "You protect the firm from sloppy thinking. Your insistence on evidence makes the work better. You find the flaw in the plan that everyone else missed. Client recommendations are credible because they are grounded in your analysis.",
    leanIn: "Offer to be the data backbone of your team's strategy work. Build the research brief, run the numbers, pressure-test the assumptions. Also, when you spot a flaw, frame it as a contribution rather than a criticism. 'I found something that could make this stronger' lands better than 'this is wrong,' even though you mean the same thing." },
  context: { n: "Context", d: "strategic_thinking", desc: "You enjoy thinking about the past. You understand the present by researching its history.",
    atWork: "You are the institutional memory. Before you form an opinion, you want to know what has been tried before, what the dynamics have been, and how the current situation came to be. You believe the past is instructive.",
    atBest: "You prevent the team from repeating mistakes. You bring historical perspective that makes current strategies more grounded. You are the person who remembers the backstory that changes the whole conversation.",
    leanIn: "Build and maintain a knowledge base. Document what has worked, what has not, and why. When new team members join or new campaigns launch, offer the historical briefing. Your institutional memory is one of the firm's most undervalued assets, so make it accessible rather than keeping it in your head." },
  futuristic: { n: "Futuristic", d: "strategic_thinking", desc: "You are inspired by the future and what could be. You energize others with vivid visions of possibility.",
    atWork: "You are the visionary. You see what the firm could become, what a campaign could accomplish, what the movement could look like in five years. You paint pictures of the future that inspire others.",
    atBest: "You pull the team toward ambitious goals. You help people see beyond the immediate deliverable to the larger possibility. Your vision creates energy and direction, and you are the reason the firm does not get complacent.",
    leanIn: "Share your vision regularly and specifically. Do not just think about the future, articulate it to others. Write the strategy memo that describes where a client could be in three years. Pitch the new service offering. Your ability to see what does not exist yet is rare, and it only becomes powerful when you make it visible." },
  ideation: { n: "Ideation", d: "strategic_thinking", desc: "You are fascinated by ideas. You find connections between seemingly disparate phenomena.",
    atWork: "You are the idea person. You make connections others do not see, you generate creative solutions to stuck problems, and you love the moment when a new concept clicks into place.",
    atBest: "You bring innovation. You keep the firm's work fresh and original. You solve problems that linear thinkers cannot crack. You see the creative angle on a campaign or the unexpected coalition opportunity.",
    leanIn: "Create structured brainstorm moments for your team. Your ideas are most powerful when they have a container. Also, learn to quickly sort your own ideas into 'explore now' versus 'park for later,' because your volume of ideas is a feature, not a bug, as long as you help others navigate it." },
  input: { n: "Input", d: "strategic_thinking", desc: "You have a need to collect and archive. You accumulate information, ideas, and artifacts.",
    atWork: "You are the collector. You read widely, bookmark constantly, and file away facts that might be useful someday. You are the person the team comes to when they need a reference, a stat, or background information.",
    atBest: "You are a walking resource library. Your breadth of knowledge makes you invaluable in strategy sessions and rapid response situations. You connect dots that others cannot because you have more dots to connect.",
    leanIn: "Make your collection accessible. Build shared reference libraries, circulate relevant articles to the team, and offer to do the background research on new accounts. Your knowledge is most valuable when it flows to others, not when it stays in your bookmarks folder." },
  intellection: { n: "Intellection", d: "strategic_thinking", desc: "You are characterized by intellectual activity. You are introspective and appreciate time for musing and reflection.",
    atWork: "You are the deep thinker. You need time alone to process, reflect, and arrive at your conclusions. Your best ideas do not come in the meeting. They come later, after you have had time to turn the problem over in your mind.",
    atBest: "When you speak, it is considered and insightful. You see angles others miss because you have spent more time thinking about the problem than anyone else. Your depth compensates for speed and often produces the breakthrough.",
    leanIn: "Ask for what you need. Request agendas in advance. Block thinking time on your calendar. And when you arrive at an insight after a meeting, share it. Send the follow-up email, drop the Slack message, schedule the five-minute check-in. Your thinking is too valuable to stay in your head." },
  learner: { n: "Learner", d: "strategic_thinking", desc: "You have a great desire to learn and continuously improve. The process of learning excites you more than the outcome.",
    atWork: "You are energized by the process of learning itself. You actively seek out new skills, new subjects, and new tools. You are one of the first to adopt a new platform or explore a new approach.",
    atBest: "You are the team's growth engine. Your curiosity drives continuous improvement. You bring new approaches and fresh perspectives because you are always learning, and you model what it looks like to stay relevant in a changing field.",
    leanIn: "Teach what you learn. When you pick up a new skill or approach, share it with the team. Offer to lead a lunch-and-learn, write a brief, or build a template. Your learning becomes exponentially more valuable when it spreads beyond you." },
  strategic: { n: "Strategic", d: "strategic_thinking", desc: "You create alternative ways to proceed. Faced with any scenario, you quickly spot the relevant patterns and issues.",
    atWork: "You are the chess player. You see the whole board, think multiple moves ahead, and quickly identify the path with the best odds. You sort through clutter, discard dead ends, and find the route others would not have seen.",
    atBest: "You make the firm smarter. Your ability to see patterns, anticipate reactions, and evaluate options makes every strategy you touch sharper. You save the team time by identifying the best path faster than a committee could.",
    leanIn: "Make your strategic thinking visible. When you see the path, walk others through your reasoning so they can follow your logic and learn from it. Also, offer to do the strategic review on accounts that feel stuck. Your ability to quickly generate and evaluate options is exactly what those situations need." },
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
async function lookupSupabase(email) {
  if (!supabase) return null;
  try {
    var { data, error } = await supabase
      .from("quiz_results")
      .select("name, top_5, rankings, domain_scores, created_at")
      .eq("email", email.toLowerCase().trim())
      .order("created_at", { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) return null;
    var row = data[0];
    // Reconstruct ranked array from stored rankings
    var ranked = row.rankings.map(function(r) {
      return { id: r.id, score: r.score };
    });
    return { name: row.name, ranked: ranked, fromDatabase: true, created_at: row.created_at };
  } catch (e) { console.error("Supabase lookup failed:", e); return null; }
}

/* ---- SUPABASE SUBMISSION ---- */
async function submitToSupabase(email, name, ranked) {
  if (!supabase) return;
  try {
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
    });
  } catch (e) { console.error("Failed to submit results:", e); }
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

  function checkEmail() {
    if (!email.trim().includes("@")) return;
    setChecking(true);
    var s = loadData(email);
    if (s && s.answers && s.answers.length > 0) {
      setFoundSaved(s);
      if (s.name) setName(s.name);
      setChecking(false);
    } else {
      // Nothing in localStorage — check Supabase for completed results
      lookupSupabase(email).then(function(result) {
        if (result && result.ranked) {
          setFoundSaved({ answers: [], ranked: result.ranked, completed: true, name: result.name, fromDatabase: true });
          if (result.name) setName(result.name);
        } else { setFoundSaved(null); }
        setChecking(false);
      }).catch(function() { setFoundSaved(null); setChecking(false); });
    }
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
          {checking && <p style={{ fontSize: 12, color: "#9999aa" }}>Checking for saved progress...</p>}
          {foundSaved && (
            <div style={{ marginBottom: 16 }}>
              {foundSaved.fromDatabase ? (
                <p style={{ fontSize: 13, color: "#059669", fontWeight: 600, margin: "0 0 10px" }}>Welcome back{foundSaved.name ? ", " + foundSaved.name : ""}! We found your previous results.</p>
              ) : (
                <p style={{ fontSize: 13, color: "#059669", fontWeight: 600, margin: "0 0 10px" }}>Welcome back{foundSaved.name ? ", " + foundSaved.name : ""}! You have {foundSaved.answers.length} answers saved.</p>
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                {foundSaved.fromDatabase && foundSaved.completed ? (
                  <button onClick={function() { props.onTestResults(foundSaved.ranked, foundSaved.name || name); }} style={{ padding: "14px 44px", borderRadius: 8, border: "none", cursor: "pointer", background: "#6D28D9", color: "#fff", fontSize: 16, fontWeight: 600 }}>View My Results</button>
                ) : (
                  <button onClick={function() { props.onStart(true, email, foundSaved.name || name); }} style={{ padding: "14px 44px", borderRadius: 8, border: "none", cursor: "pointer", background: "#6D28D9", color: "#fff", fontSize: 16, fontWeight: 600 }}>Resume</button>
                )}
                <button onClick={function() { props.onStart(false, email, name); }} style={{ padding: "10px 30px", borderRadius: 8, border: "1px solid #e8e6f0", cursor: "pointer", background: "transparent", color: "#555570", fontSize: 14 }}>Start Fresh</button>
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
  var css = "body{font-family:Helvetica,Arial,sans-serif;color:#1a1a2e;margin:0;padding:40px 50px;font-size:11pt;line-height:1.6} h1{font-size:28pt;margin:0 0 4px} h2{font-size:18pt;margin:24px 0 8px} h3{font-size:13pt;margin:16px 0 4px;color:#6D28D9} .domain{font-size:9pt;font-weight:bold;letter-spacing:1px} .desc{color:#555;margin:4px 0 12px} .section-label{font-size:9pt;font-weight:bold;color:#6D28D9;letter-spacing:1.5px;text-transform:uppercase;margin:14px 0 4px} .section-body{color:#555;margin:0 0 8px} .hr{border:none;border-top:2px solid #6D28D9;margin:16px 0} .hr-light{border:none;border-top:1px solid #e8e6f0;margin:12px 0} .rank-row{display:flex;align-items:center;gap:12px;padding:6px 0;border-bottom:1px solid #eee} .rank-num{width:30px;font-weight:bold;color:#9999aa} .rank-num.top5{color:#6D28D9} .rank-name{flex:1;font-weight:600} .rank-name.top5{font-weight:bold} .rank-domain{font-size:9pt;color:#999} .page-break{page-break-before:always} .header{font-size:8pt;color:#999;border-bottom:2px solid #6D28D9;padding-bottom:6px;margin-bottom:24px;display:flex;justify-content:space-between} .company{font-size:10pt;color:#555;margin:8px 0} @media print{body{padding:30px 40px}}";

  var domainColors = {executing:"#7C3AED",influencing:"#DC2626",relationship_building:"#2563EB",strategic_thinking:"#059669"};
  function dc(id){var t=TH[id];return t?domainColors[t.d]||"#6D28D9":"#6D28D9";}
  function dn(id){var t=TH[id];return t?DOMAINS[t.d].name:"";}

  var html = "<html><head><title>"+(name||"")+" - "+(type==="top5"?"Top 5 Report":"Full 34 Report")+"</title><style>"+css+"</style></head><body>";

  if (type === "top5") {
    // Cover
    html += "<div class='header'><span style='font-weight:bold;color:#6D28D9'>STRENGTHS DISCOVERY</span><span>Top 5 Report</span></div>";
    html += "<div style='margin-top:60px'><div style='color:#999;font-size:12pt;margin-bottom:4px'>"+(name||"")+"</div>";
    html += "<h1>Your Top 5<br/>Strengths Report</h1><hr class='hr'/>";
    // List on cover
    top5.forEach(function(t,i){
      html += "<div style='font-size:14pt;margin:8px 0 8px 10px'><span style='color:"+dc(t.id)+";font-weight:bold'>"+(i+1)+".</span> <b>"+TH[t.id].n+"</b> <span style='font-size:9pt;color:#999'>"+dn(t.id)+"</span></div>";
    });
    html += "</div>";

    // Individual pages
    top5.forEach(function(t,i){
      var th=TH[t.id]; var rd=REVEAL_DATA[t.id]||{}; var col=dc(t.id);
      var rarity = (rd.pct||0)<=8?"Rare":(rd.pct||0)<=15?"Uncommon":"Common";
      html += "<div class='page-break'>";
      html += "<div class='header'><span style='font-weight:bold;color:#6D28D9'>STRENGTHS DISCOVERY</span><span>"+(name||"")+"</span></div>";
      html += "<div style='font-size:32pt;font-weight:bold;color:"+col+";margin:0'>#"+(i+1)+"</div>";
      html += "<h2 style='margin:0 0 4px'>"+th.n+"</h2>";
      html += "<div class='domain' style='color:"+col+"'>"+dn(t.id)+"</div>";
      html += "<hr class='hr' style='border-color:"+col+"'/>";
      html += "<div class='desc'>"+th.desc+"</div>";
      html += "<div style='font-size:10pt;color:#555;margin-bottom:4px'><b>"+(rd.pct||"?")+"% </b>of people have this in their top 5 <span style='color:"+col+"'>("+rarity+")</span></div>";
      html += "<div class='company'>In Good Company: <b>"+(rd.fic||"")+"</b> (Fictional) &nbsp;|&nbsp; <b>"+(rd.real||"")+"</b> (Real World)</div>";
      html += "<hr class='hr-light'/>";
      var ins = insights && insights.themes ? insights.themes[t.id] : null;
      if (ins && ins.unique) {
        html += "<div class='section-label' style='color:#6D28D9'>WHY YOUR "+th.n.toUpperCase()+" IS UNIQUE</div><div class='section-body'>"+ins.unique+"</div>";
      }
      html += "<div class='section-label'>AT WORK</div><div class='section-body'>"+(th.atWork||"")+"</div>";
      html += "<div class='section-label'>AT YOUR BEST</div><div class='section-body'>"+(th.atBest||"")+"</div>";
      html += "<div class='section-label'>HOW TO LEAN IN</div><div class='section-body'>"+(th.leanIn||"")+"</div>";
      if (ins && ins.blindSpots) {
        html += "<div class='section-label' style='color:#DC2626'>WATCH OUT</div><div class='section-body'>"+ins.blindSpots+"</div>";
      }
      html += "</div>";
    });
    // Blends page
    if (insights && insights.blends && insights.blends.length > 0) {
      html += "<div class='page-break'>";
      html += "<div class='header'><span style='font-weight:bold;color:#6D28D9'>STRENGTHS DISCOVERY</span><span>"+(name||"")+"</span></div>";
      html += "<h2>How Your Strengths Combine</h2>";
      html += "<div class='desc' style='margin-bottom:16px'>Your top 5 don't operate in isolation. Here's how they interact.</div>";
      insights.blends.forEach(function(b) {
        var nameA = TH[b.a] ? TH[b.a].n : b.a;
        var nameB = TH[b.b] ? TH[b.b].n : b.b;
        html += "<div style='margin-bottom:12px;padding:10px 14px;border-left:3px solid #6D28D9;background:#f8f7fc;border-radius:0 6px 6px 0'>";
        html += "<div style='font-weight:bold;font-size:10pt;color:#1a1a2e;margin-bottom:2px'>"+nameA+" + "+nameB+"</div>";
        html += "<div style='font-size:10pt;color:#555'>"+b.text+"</div>";
        html += "</div>";
      });
      html += "</div>";
    }
    // Summary page
    if (insights && insights.summary) {
      html += "<div class='page-break'>";
      html += "<div class='header'><span style='font-weight:bold;color:#6D28D9'>STRENGTHS DISCOVERY</span><span>"+(name||"")+"</span></div>";
      html += "<div style='margin-top:100px;text-align:center'>";
      html += "<div style='font-size:10pt;color:#999;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px'>YOUR OPERATING STYLE</div>";
      html += "<div style='font-size:16pt;font-style:italic;color:#1a1a2e;line-height:1.6;max-width:400px;margin:0 auto'>\""+insights.summary+"\"</div>";
      html += "</div></div>";
    }
  } else {
    // Full 34
    html += "<div class='header'><span style='font-weight:bold;color:#6D28D9'>STRENGTHS DISCOVERY</span><span>Theme Sequence Report</span></div>";
    html += "<div style='margin-top:60px'><div style='color:#999;font-size:12pt;margin-bottom:4px'>"+(name||"")+"</div>";
    html += "<h1>Theme Sequence<br/>Report</h1><hr class='hr'/>";
    html += "<div class='desc'>Your complete ranking of all 34 strength themes. Your top themes represent your natural talents. The themes toward the bottom are less apparent in your day-to-day behaviors.</div></div>";
    html += "<div class='page-break'>";
    html += "<div class='header'><span style='font-weight:bold;color:#6D28D9'>STRENGTHS DISCOVERY</span><span>"+(name||"")+"</span></div>";
    html += "<h2>Your Full 34</h2>";

    var sections = [{name:"STRENGTHEN",desc:"Your signature themes. Lead with these.",s:0,e:5},{name:"NAVIGATE",desc:"These support your top 5. Use them intentionally.",s:5,e:10},{name:"DEVELOP",desc:"These show potential. Invest selectively.",s:10,e:20},{name:"MANAGE",desc:"Less natural. Be aware of them.",s:20,e:34}];
    sections.forEach(function(sec){
      html += "<div style='margin-top:16px'><div style='font-weight:bold;color:#6D28D9;font-size:11pt'>"+sec.name+"</div>";
      html += "<div style='font-size:9pt;color:#999;margin-bottom:8px'>"+sec.desc+"</div>";
      for(var i=sec.s;i<Math.min(sec.e,ranked.length);i++){
        var t=ranked[i]; var th=TH[t.id]; var col=dc(t.id); var isT5=i<5;
        html += "<div class='rank-row'><div class='rank-num"+(isT5?" top5":"")+"' style='"+(isT5?"color:"+col:"")+"'>"+(i+1)+".</div>";
        html += "<div class='rank-name"+(isT5?" top5":"")+"'>"+th.n+"</div>";
        html += "<div class='rank-domain' style='color:"+col+"'>"+dn(t.id)+"</div></div>";
      }
      html += "</div>";
    });
    html += "</div>";
  }

  html += "</body></html>";

  var frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:99999;background:#fff";
  document.body.appendChild(frame);
  var fdoc = frame.contentDocument || frame.contentWindow.document;
  fdoc.open();
  fdoc.write(html);
  fdoc.close();
  var closeBtn = fdoc.createElement("div");
  closeBtn.innerHTML = "\u2715 Close";
  closeBtn.style.cssText = "position:fixed;top:12px;right:16px;background:#6D28D9;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;z-index:100;font-family:sans-serif";
  closeBtn.onclick = function() { document.body.removeChild(frame); };
  fdoc.body.appendChild(closeBtn);
  var printBtn = fdoc.createElement("div");
  printBtn.innerHTML = "\uD83D\uDDA8 Save as PDF";
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
          {ins && ins.blindSpots && (
            <SectionButton themeId={t.id} section="blindSpots" label="Watch Out" text={ins.blindSpots} />
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
            if (ins && ins.blindSpots) body += "WATCH OUT: " + ins.blindSpots + "\n\n";
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

  var prompt = "You are a strengths coach analyzing someone's assessment results. Their name is " + (name || "this person") + ".\n\n" +
    "Their top 5 strengths in order: " + t5names.join(", ") + "\n" +
    "Their domains: " + t5domains.join(", ") + "\n" +
    "Their top 10: " + t10names.join(", ") + "\n\n" +
    "Generate a JSON object with NO other text, no markdown backticks, no preamble. Just raw JSON.\n\n" +
    "The JSON should have this structure:\n" +
    "{\n" +
    '  "themes": {\n' +
    '    "<theme_key>": {\n' +
    '      "unique": "2-3 sentences about why THIS person\'s version of this strength is unique given their specific combination. Reference how their other top 5 strengths interact with this one. Write in second person (you). Be specific and insightful, not generic.",\n' +
    '      "blindSpots": "2-3 sentences about what to watch out for with this strength. Be honest and direct, not sugarcoated. Write in second person."\n' +
    "    }\n" +
    "  },\n" +
    '  "blends": [\n' +
    '    { "a": "<theme1_key>", "b": "<theme2_key>", "text": "One punchy sentence about how these two strengths interact in this person. Like a tagline." }\n' +
    "  ],\n" +
    '  "summary": "One sentence that captures this person\'s entire operating style based on all 5. Write it like a brand statement. Direct, memorable, no fluff."\n' +
    "}\n\n" +
    "Theme keys to use: " + top5.map(function(t) { return t.id; }).join(", ") + "\n\n" +
    "For blends, generate all 10 pairwise combinations of the top 5 (1+2, 1+3, 1+4, 1+5, 2+3, 2+4, 2+5, 3+4, 3+5, 4+5).\n\n" +
    "Remember: ONLY output valid JSON. No backticks, no explanation, no preamble.";

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
        submitToSupabase(userEmail, userName, sc);
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
      {screen === "results" && ranked && <ResultsScreen ranked={ranked} onRetake={handleRetake} onReveal={function() { setScreen("reveal"); }} name={userName} insights={insights} />}
    </div>
  );
}
