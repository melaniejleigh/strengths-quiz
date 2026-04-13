import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";
// html2pdf removed — using iframe preview + browser print-to-PDF for full CSS fidelity

/* ---- DOMAINS ---- */
var DOMAINS = {
  executing: { name: "Executing", color: "#7C3AED", themes: ["achiever","arranger","belief","consistency","deliberative","discipline","focus","responsibility","restorative"] },
  influencing: { name: "Influencing", color: "#DC2626", themes: ["activator","command","communication","competition","maximizer","self_assurance","significance","woo"] },
  relationship_building: { name: "Relationship Building", color: "#2563EB", themes: ["adaptability","connectedness","developer","empathy","harmony","includer","individualization","positivity","relator"] },
  strategic_thinking: { name: "Strategic Thinking", color: "#059669", themes: ["analytical","context","futuristic","ideation","input","intellection","learner","strategic"] },
};
var DO = ["executing","influencing","relationship_building","strategic_thinking"];

import { TH, ALL_T } from "./themeData.js";

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

  // Fixed 8.5x11 letter page (612x792pt) - width set for html2pdf at 8.5in
  var css = [
    "*{box-sizing:border-box;margin:0;padding:0}",
    "body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a2e;font-size:9pt;line-height:1.5;width:8.5in}",
    ".page{padding:36px 48px;position:relative}",
    ".page-break{page-break-before:always}",
    // Header
    ".hdr{display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;border-bottom:1.5px solid #e2e0ea;margin-bottom:18px;font-size:7.5pt}",
    ".hdr-brand{font-weight:800;color:#6D28D9;letter-spacing:2.5px;text-transform:uppercase}",
    ".hdr-meta{color:#aaa;font-weight:500}",
    // Cover
    ".cover{background:linear-gradient(160deg,#0a0a1a 0%,#1a0a2e 40%,#2d1054 70%,#0a0a1a 100%);color:#fff;display:flex;flex-direction:column;justify-content:flex-end;height:11in;width:8.5in;padding:0}",
    ".cover-inner{padding:0 56px 64px}",
    ".cover-label{font-size:8pt;letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:16px;font-weight:600}",
    ".cover-title{font-size:36pt;font-weight:800;line-height:1.05;margin-bottom:12px}",
    ".cover-sub{font-size:11pt;color:rgba(255,255,255,0.4);line-height:1.5;max-width:380px}",
    ".cover-themes{margin-top:36px}",
    ".cover-row{display:flex;align-items:center;gap:14px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06)}",
    ".cover-num{font-size:22pt;font-weight:800;width:36px;text-align:right}",
    ".cover-tname{font-size:12pt;font-weight:700}",
    ".cover-tdomain{font-size:7pt;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;opacity:0.5}",
    // Section styles
    ".sec-label{font-size:7pt;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:4px}",
    ".sec-body{font-size:9pt;color:#444;line-height:1.55}",
    ".callout{padding:16px 20px;border-radius:10px;margin:10px 0;line-height:1.55}",
    ".quote-box{text-align:center;padding:20px;border-radius:10px;background:linear-gradient(135deg,#f5f0ff,#eff6ff);border:1px solid #e8e6f0;margin:14px 0}",
    ".quote-text{font-size:12pt;font-weight:700;color:#1a1a2e;line-height:1.4}",
    // Theme pages (Top 5 deep dives)
    ".theme-hdr{margin-bottom:12px}",
    ".theme-rank{font-size:36pt;font-weight:900;line-height:1}",
    ".theme-name{font-size:22pt;font-weight:800;line-height:1.15}",
    ".theme-domain{font-size:7pt;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-top:3px}",
    ".theme-bar{height:2px;border:none;border-radius:2px;margin:8px 0}",
    ".theme-thrive{font-size:9.5pt;color:#333;line-height:1.55;font-style:italic;margin-bottom:10px}",
    ".theme-section{margin-top:12px}",
    ".theme-section h3{font-size:9.5pt;font-weight:700;color:#1a1a2e;margin-bottom:4px}",
    ".theme-section p{font-size:8.5pt;color:#555;line-height:1.55;margin-bottom:5px}",
    // Blind spots
    ".bs-box{padding:12px 16px;border-radius:8px;background:#fafafa;border-left:3px solid #999;margin:5px 0;font-size:8.5pt;color:#555;line-height:1.5}",
    // Action items
    ".ai-item{display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px solid #f0eff5}",
    ".ai-num{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:7pt;font-weight:800;color:#fff;flex-shrink:0;margin-top:2px}",
    ".ai-text{font-size:8.5pt;color:#444;line-height:1.5}",
    // Blend cards
    ".blend-card{margin-bottom:8px;border-radius:8px;overflow:hidden;border:1px solid #e8e6f0}",
    ".blend-hdr{padding:7px 12px;display:flex;align-items:center;gap:6px}",
    ".blend-title{font-weight:700;font-size:9pt;color:#fff}",
    ".blend-plus{font-size:10pt;font-weight:300;color:rgba(255,255,255,0.5)}",
    ".blend-body{padding:8px 12px;font-size:8.5pt;line-height:1.5;color:#444}",
    ".blend-tag{font-weight:700;color:#1a1a2e;margin-bottom:2px}",
    // Full 34 ranking overview
    ".rank-row{display:flex;align-items:center;gap:8px;padding:3px 2px;border-bottom:1px solid #f5f4fa}",
    ".rank-num{width:22px;font-weight:700;font-size:9pt;text-align:right;color:#ccc}",
    ".rank-bar{height:4px;border-radius:3px;min-width:3px}",
    ".rank-name{font-weight:600;font-size:9pt;flex:1}",
    ".rank-domain{font-size:7pt;font-weight:600;letter-spacing:1px;text-transform:uppercase}",
    ".band-label{font-size:10pt;font-weight:800;margin:14px 0 2px}",
    ".band-desc{font-size:8pt;color:#999;margin-bottom:6px}",
    // Full 34 theme entries - compact flowing layout
    ".f34-theme{page-break-inside:avoid;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #eeecf5}",
    ".f34-hdr{display:flex;align-items:center;gap:10px;margin-bottom:4px}",
    ".f34-rank{font-size:16pt;font-weight:900;width:28px;text-align:right}",
    ".f34-name{font-size:12pt;font-weight:800}",
    ".f34-domain{font-size:6.5pt;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}",
    ".f34-copy{font-size:8.5pt;color:#444;line-height:1.5;margin-bottom:4px}",
    ".f34-label{font-size:6.5pt;font-weight:700;color:#888;letter-spacing:1.5px;text-transform:uppercase;margin:8px 0 3px;padding-top:5px;border-top:1px solid #f0eff5}",
    // Section dividers (inline, not full-page)
    ".sec-divider{page-break-before:always;padding:24px 0 12px;margin-bottom:8px;border-bottom:2px solid #e8e6f0}",
    ".sec-divider-title{font-size:14pt;font-weight:800;color:#1a1a2e;margin-bottom:3px}",
    ".sec-divider-sub{font-size:7.5pt;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px}",
    ".sec-divider-desc{font-size:8.5pt;color:#666;line-height:1.5}",
    // Domain balance
    ".domain-block{padding:10px 14px;border-radius:8px;margin-bottom:6px;display:flex;align-items:center;gap:12px}",
    ".domain-bar{height:6px;border-radius:3px;flex:1}",
    ".domain-name{font-size:9pt;font-weight:700;width:130px}",
    ".domain-count{font-size:9pt;font-weight:700;width:30px;text-align:right}",
    // Summary / pill
    ".pill{display:inline-block;padding:5px 14px;border-radius:18px;font-weight:700;font-size:9pt;margin:0 3px 6px}"
  ].join("\n");

  var html = "";

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
          html += "<div class='ai-item'><span class='ai-num' style='background:"+col+"'>"+(idx+1)+"</span><span class='ai-text'>"+item.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")+"</span></div>";
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
    html += "<div style='margin-top:36px;font-size:14pt;font-weight:600;color:rgba(255,255,255,0.85)'>"+(name||"")+"</div>";
    html += "<div style='margin-top:4px;font-size:9pt;color:rgba(255,255,255,0.35)'>"+(new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}))+"</div>";
    html += "</div></div>";

    // --- 2. INTRO + RANKING on the same flow ---
    html += "<div class='page page-break'>";
    html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>"+(name||"")+"</span></div>";
    html += "<h2 style='font-size:16pt;font-weight:800;margin-bottom:10px'>How to Read This Report</h2>";
    html += "<p class='sec-body' style='margin-bottom:8px'>This report shows all 34 strengths themes in rank order, from most dominant to least dominant. The themes at the top are the clearest patterns in how you naturally think, work, and contribute. As you move down the ranking, the themes become less instinctive and less central, but they do not become flaws.</p>";
    html += "<p class='sec-body' style='margin-bottom:8px'>Your lower-ranked themes are not weaknesses to fix. They are simply less dominant patterns. The goal is not to become equally strong in all 34, but to understand where you naturally lead and use those strengths with more intention.</p>";
    html += "<p class='sec-body' style='margin-bottom:8px'>Use this report as a map, not a mandate. It is here to help you understand the full shape of your strengths, not to turn every lower-ranked theme into a problem to solve.</p>";
    html += "</div>";

    // --- 3. FULL RANKING OVERVIEW ---
    html += "<div class='page page-break'>";
    html += "<div class='hdr'><span class='hdr-brand'>Strengths Discovery</span><span class='hdr-meta'>"+(name||"")+" &middot; Full Ranking</span></div>";
    html += "<h2 style='font-size:16pt;font-weight:800;margin-bottom:12px'>Your Full Ranking</h2>";

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
    html += "<h2 style='font-size:16pt;font-weight:800;margin-bottom:4px'>What Stands Out in Your Profile</h2>";
    html += "<p style='font-size:8.5pt;color:#999;margin-bottom:14px'>A synthesis of your full 34 ranking.</p>";

    // AI interpretation
    if (insights && insights.full34Interpretation) {
      html += "<div style='margin-bottom:14px'><p class='sec-body'>"+insights.full34Interpretation+"</p></div>";
    } else if (insights && insights.fullProfile) {
      html += "<div style='margin-bottom:14px'><p class='sec-body'>"+insights.fullProfile+"</p></div>";
    }

    // Domain distribution
    var domainCounts = {executing:0,influencing:0,relationship_building:0,strategic_thinking:0};
    var domainTop10 = {executing:0,influencing:0,relationship_building:0,strategic_thinking:0};
    ranked.forEach(function(t,i){
      domainCounts[TH[t.id].d]++;
      if(i<10) domainTop10[TH[t.id].d]++;
    });
    html += "<div style='margin-top:12px'>";
    html += "<div class='sec-label' style='color:#6D28D9;margin-bottom:8px'>Domain Distribution</div>";
    var domOrder = ["strategic_thinking","executing","influencing","relationship_building"];
    domOrder.forEach(function(did){
      var dname = DOMAINS[did].name;
      var dcol = domainColors[did];
      var total = domainCounts[did];
      var inTop = domainTop10[did];
      var barPct = Math.round((total/34)*100);
      html += "<div style='display:flex;align-items:center;gap:10px;margin-bottom:5px'>";
      html += "<div style='width:120px;font-size:8.5pt;font-weight:600;color:#333'>"+dname+"</div>";
      html += "<div style='flex:1;height:6px;background:#f0eff5;border-radius:3px;overflow:hidden'><div style='height:100%;width:"+barPct+"%;background:"+dcol+";border-radius:3px'></div></div>";
      html += "<div style='width:80px;text-align:right;font-size:8pt;color:#888'>"+total+" total";
      if(inTop>0) html += " <span style='color:"+dcol+";font-weight:600'>("+inTop+" in top 10)</span>";
      html += "</div></div>";
    });
    html += "</div>";

    // AI domain interpretation
    if (insights && insights.full34DomainMix) {
      html += "<div style='margin-top:10px'><p class='sec-body'>"+insights.full34DomainMix+"</p></div>";
    } else if (insights && insights.dominantDomain) {
      html += "<div style='margin-top:10px'><p class='sec-body'>"+insights.dominantDomain+"</p></div>";
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

    // Section definitions - inline dividers, not full splash pages
    var sections = [
      {name:"The Top 5",sub:"Dominant",s:0,e:5,color:"#6D28D9",
       intro:"These are your most dominant strengths, the clearest patterns in how you naturally work, think, and contribute. This is where the greatest developmental value usually lives."},
      {name:"6\u201310",sub:"Supporting",s:5,e:10,color:"#2563EB",
       intro:"These are strong supporting strengths. They may not define you as clearly as your top five, but they show up often and add meaningful range to how you operate."},
      {name:"11\u201317",sub:"Available",s:10,e:17,color:"#0891B2",
       intro:"These strengths are present and available, but they are not primary lead patterns. You may draw on them in the right context, even if they are not your strongest defaults."},
      {name:"18\u201326",sub:"Situational",s:17,e:26,color:"#059669",
       intro:"These are less instinctive strengths. They are not weaknesses, just themes you are less likely to lead with naturally. You may still use them situationally or appreciate them more when others bring them into the room."},
      {name:"27\u201334",sub:"Least Dominant",s:26,e:34,color:"#9CA3AF",
       intro:"These are your least dominant themes. They are not flaws to fix. They are simply less central to how you naturally operate and are more likely to be supported through context, structure, or partnership than through instinct alone."}
    ];

    sections.forEach(function(sec) {
      // Inline section divider — starts a new page but doesn't waste a full page
      html += "<div class='sec-divider'>";
      html += "<div class='sec-divider-sub' style='color:"+sec.color+"'>"+sec.sub+"</div>";
      html += "<div class='sec-divider-title'>"+sec.name+"</div>";
      html += "<div class='sec-divider-desc'>"+sec.intro+"</div>";
      html += "</div>";

      // Theme entries — flow continuously, page-break-inside:avoid keeps them whole
      for (var ti = sec.s; ti < Math.min(sec.e, ranked.length); ti++) {
        var t = ranked[ti]; var th = TH[t.id]; var col = dc(t.id);

        html += "<div class='f34-theme'>";
        // Theme header: rank + name + domain
        html += "<div class='f34-hdr'>";
        html += "<div class='f34-rank' style='color:"+col+"'>"+(ti+1)+"</div>";
        html += "<div><div class='f34-name'>"+th.n+"</div>";
        html += "<div class='f34-domain' style='color:"+col+"'>"+dn(t.id)+"</div></div></div>";

        // Intro paragraph (rank-specific)
        html += "<p class='f34-copy'>"+rankIntro(ti, th)+"</p>";

        // Context line (thrive / available / low)
        html += "<p class='f34-copy' style='font-style:italic;color:#555'>"+contextLine(ti, th)+"</p>";

        // Core line
        html += "<p class='f34-copy'>"+coreLine(ti, th)+"</p>";

        // Special section (blind spots / watch for / underused advantage / works best when / support strategy)
        if (th.overuseTrigger1 || th.underuseAdvantage || th.supportCondition) {
          html += specialSection(ti, th);
        }

        // Closing line (Top 5 and Supporting only)
        var cl = closingLine(ti, th);
        if (cl) {
          html += "<p class='f34-copy' style='font-style:italic;color:#666;margin-top:4px'>"+cl+"</p>";
        }

        html += "</div>"; // end f34-theme
      }
    });

    // --- CLOSING ---
    html += "<div style='page-break-before:always;padding:36px 48px'>";
    html += "<h2 style='font-size:18pt;font-weight:800;margin-bottom:14px;text-align:center'>How to Use This Report</h2>";
    html += "<div style='max-width:480px;margin:0 auto'>";
    html += "<p class='sec-body' style='margin-bottom:10px;text-align:center'>This report is meant to help you understand the full shape of your strengths profile, not to turn every lower-ranked theme into a development project.</p>";
    html += "<p class='sec-body' style='margin-bottom:10px;text-align:center'>Your top themes are where you are most likely to find the greatest return from deeper reflection, stronger application, and more intentional development. The rest of your profile still matters, but not every theme needs equal attention.</p>";
    html += "<p class='sec-body' style='margin-bottom:10px;text-align:center'>Use this report to understand where you naturally lead, where you have supporting range, and where you may be more likely to rely on context, structure, or partnership. Use your Top 5 report for the deeper coaching and application work.</p>";
    html += "<div style='text-align:center;margin-top:20px'>";
    html += "<p style='font-size:9pt;color:#bbb'>Strengths Discovery &middot; "+(new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}))+"</p>";
    html += "</div></div></div>";
  }

  var fullHtml = "<html><head><title>"+(name||"")+" - "+(type==="top5"?"Top 5 Strengths Report":"Full 34 Strengths Report")+"</title><style>"+css+"\n@media print{.no-print{display:none!important}}</style></head><body>"+html+"</body></html>";

  // Show preview modal with the report, plus download button
  var overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;background:rgba(0,0,0,0.6);display:flex;flex-direction:column;align-items:center";

  // Top toolbar
  var toolbar = document.createElement("div");
  toolbar.className = "no-print";
  toolbar.style.cssText = "width:100%;max-width:860px;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#1a1a2e;border-radius:0 0 12px 12px;flex-shrink:0";

  var titleSpan = document.createElement("span");
  titleSpan.textContent = (type==="top5"?"Top 5":"Full 34") + " Strengths Report";
  titleSpan.style.cssText = "color:#fff;font-size:14px;font-weight:600;font-family:sans-serif";

  var btnGroup = document.createElement("div");
  btnGroup.style.cssText = "display:flex;gap:8px;align-items:center";

  var dlBtn = document.createElement("button");
  dlBtn.textContent = "\u2B07 Download PDF";
  dlBtn.style.cssText = "background:#6D28D9;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:sans-serif";

  var closeBtn = document.createElement("button");
  closeBtn.textContent = "\u2715";
  closeBtn.style.cssText = "background:rgba(255,255,255,0.1);color:#fff;border:none;width:34px;height:34px;border-radius:8px;font-size:16px;cursor:pointer;font-family:sans-serif";

  btnGroup.appendChild(dlBtn);
  btnGroup.appendChild(closeBtn);
  toolbar.appendChild(titleSpan);
  toolbar.appendChild(btnGroup);

  // iframe preview
  var frame = document.createElement("iframe");
  frame.style.cssText = "flex:1;width:100%;max-width:860px;border:none;margin:8px 0 12px;border-radius:8px;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,0.3)";

  overlay.appendChild(toolbar);
  overlay.appendChild(frame);
  document.body.appendChild(overlay);

  var fdoc = frame.contentDocument || frame.contentWindow.document;
  fdoc.open(); fdoc.write(fullHtml); fdoc.close();

  // Download: trigger print dialog on the iframe (saves as PDF with full CSS fidelity)
  dlBtn.onclick = function() { frame.contentWindow.print(); };

  // Close
  closeBtn.onclick = function() { document.body.removeChild(overlay); };
  overlay.addEventListener("click", function(e) { if (e.target === overlay) document.body.removeChild(overlay); });
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

      {/* ---- HERO: Download Reports ---- */}
      <div style={{ marginBottom: 32, padding: "28px 24px", borderRadius: 16, background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 50%, #8B5CF6 100%)", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#e0d4ff", marginBottom: 6, fontWeight: 600 }}>Your Personalized Reports</div>
        <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Download Your Strengths Reports</p>
        <p style={{ fontSize: 13, color: "#d4c4ff", margin: "0 0 20px", lineHeight: 1.5 }}>AI-powered insights tailored to your unique profile, beautifully formatted and ready to share.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={function() { printReport("top5", ranked, props.name, props.insights); }} style={{ padding: "14px 28px", borderRadius: 10, border: "2px solid #fff", cursor: "pointer", background: "#fff", color: "#6D28D9", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{"\u2B07"}</span> Top 5 Report
          </button>
          <button onClick={function() { printReport("full34", ranked, props.name, props.insights); }} style={{ padding: "14px 28px", borderRadius: 10, border: "2px solid rgba(255,255,255,0.4)", cursor: "pointer", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{"\u2B07"}</span> Full 34 Report
          </button>
        </div>
      </div>

      {/* ---- Quick Glance: Top 5 list ---- */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#6D28D9", marginBottom: 12, fontWeight: 600, textAlign: "center" }}>Your Top 5 at a Glance</div>
        {top5.map(function(t, i) {
          var th = TH[t.id];
          var dc = DOMAINS[th.d].color;
          return (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", marginBottom: 6, borderRadius: 10, background: "#f8f7fc", border: "1px solid #e8e6f0" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: dc, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>{th.n}</div>
                <div style={{ fontSize: 11, color: dc, fontWeight: 500 }}>{DOMAINS[th.d].name}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: dc }}>{t.score}</div>
            </div>
          );
        })}
      </div>

      {/* ---- Explore Section ---- */}
      <div style={{ borderTop: "1px solid #e8e6f0", paddingTop: 28, marginBottom: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#6D28D9", marginBottom: 4, fontWeight: 600 }}>Explore Your Results</div>
          <p style={{ fontSize: 13, color: "#9999aa", margin: 0 }}>Dig into each theme and see how your strengths show up.</p>
        </div>

        <div style={{ display: "flex", gap: 3, marginBottom: 20, background: "#f8f7fc", borderRadius: 7, padding: 3, border: "1px solid #e8e6f0" }}>
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
      </div>

      {/* ---- Email + Actions ---- */}
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
    var response = await fetch("/api/generate-insights", {
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

  function goToReveal(sc, nm, skipReveal) {
    setScreen("generating");
    generateInsights(sc, nm).then(function(ins) {
      setInsights(ins);
      if (skipReveal && userEmail) {
        saveData(userEmail, { answers: answers, ranked: sc, completed: true, name: nm, insights: ins });
      }
      setScreen(skipReveal ? "results" : "reveal");
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
          else { goToReveal(s.ranked, s.name || name, true); }
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
      {screen === "welcome" && <Welcome onStart={handleStart} onTestResults={function(r, n) { setRanked(r); setUserName(n); goToReveal(r, n, true); }} onImport={function(r, n, e) { setRanked(r); setUserName(n); setUserEmail(e); if (e) saveData(e, { answers: [], ranked: r, completed: true, name: n }); goToReveal(r, n, true); }} />}
      {screen === "quiz" && <QuizScreen queue={queue} qi={qi} answers={answers} onPick={handlePick} phase={phase} onExit={function() { setScreen("welcome"); }} />}
      {screen === "generating" && <GeneratingScreen />}
      {screen === "reveal" && ranked && <RevealScreen ranked={ranked} name={userName} totalQ={answers.length} insights={insights} onFinish={finishReveal} />}
      {screen === "results" && ranked && <ResultsScreen ranked={ranked} onRetake={handleRetake} onReveal={function() { setScreen("reveal"); }} name={userName} insights={insights} pin={userPin} />}
    </div>
  );
}
