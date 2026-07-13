/* ============================================================
   Portfolio Assistant — client-side FAQ chatbot
   No external API calls. All answers are derived from
   Mlamuli's actual portfolio content below.
   ============================================================ */

(function () {
  'use strict';

  const BOT_NAME = 'Mlamuli\'s Assistant';

  // ---- Knowledge base -----------------------------------------------
  // Each intent has: id, keywords (for matching), response (HTML string),
  // and optional quickReplies shown after the answer.
  const INTENTS = [
    {
      id: 'greeting',
      keywords: ['hi', 'hello', 'hey', 'sup', 'yo', 'greetings', 'howzit'],
      response: "Hey! I'm a small FAQ bot trained on Mlamuli's portfolio. Ask me about his skills, projects, certifications, experience, or how to get in touch.",
      quickReplies: ['Skills', 'Projects', 'Certifications', 'Contact']
    },
    {
      id: 'skills-software',
      keywords: ['software', 'developer', 'development', 'programming', 'code', 'coding', 'language', 'languages', 'stack', 'framework', 'java', 'javascript', 'php', 'react', 'mysql', 'html', 'css', 'git'],
      response: "On the software side, Mlamuli works with <strong>Java, JavaScript, PHP, React, HTML5/CSS3, MySQL,</strong> and <strong>Git/GitHub</strong>. He's built web, desktop, and mobile apps across that stack.",
      quickReplies: ['Networking skills', 'Projects', 'Certifications']
    },
    {
      id: 'skills-networking',
      keywords: ['network', 'networking', 'tcp', 'ip', 'dns', 'dhcp', 'router', 'switch', 'infrastructure', 'server', 'windows server', 'troubleshooting', 'administration'],
      response: "On the networking side: <strong>TCP/IP, DNS, DHCP, router &amp; switch configuration, network troubleshooting, remote administration,</strong> and <strong>Windows Server fundamentals.</strong>",
      quickReplies: ['Security background', 'Software skills', 'Certifications']
    },
    {
      id: 'security',
      keywords: ['security', 'cyber', 'cybersecurity', 'hacking', 'hacker', 'ethical', 'pentest', 'penetration', 'vulnerability', 'firewall', 'analyst', 'infosec'],
      response: "Mlamuli holds four Cisco Networking Academy certifications in cybersecurity: <strong>Introduction to Cybersecurity, Cybersecurity Essentials, Networking Essentials,</strong> and <strong>Ethical Hacker.</strong> That combo of dev + networking + security is what makes him a strong fit for security analyst roles.",
      quickReplies: ['Certifications', 'Contact', 'Availability']
    },
    {
      id: 'projects',
      keywords: ['project', 'projects', 'built', 'build', 'portfolio', 'work', 'app', 'application', 'system'],
      response: "Four projects on here: a <strong>Health Mobile Application</strong> (React), the <strong>Global Transparency Investments website</strong> (HTML/CSS/JS), an <strong>Online Shopping System</strong> (Java desktop), and an <strong>Inventory Management System</strong> (JSP + MySQL). Scroll to the Projects section above to see screenshots and details.",
      quickReplies: ['Software skills', 'Certifications', 'Contact']
    },
    {
      id: 'certifications',
      keywords: ['cert', 'certs', 'certification', 'certifications', 'cisco', 'qualification', 'qualifications', 'course', 'training'],
      response: "Cisco Networking Academy certs: <strong>Introduction to Cybersecurity, Cybersecurity Essentials, Networking Essentials,</strong> and <strong>Ethical Hacker</strong> — all instructor-led. He's also taken part in the Health Hackathon (RSTP &amp; Georgetown University) and Code for Care Hackathon 2024.",
      quickReplies: ['Security background', 'Projects', 'Contact']
    },
    {
      id: 'experience-about',
      keywords: ['experience', 'background', 'about', 'who', 'bio', 'story', 'education', 'graduate', 'degree', 'university', 'study'],
      response: "Mlamuli is an IT graduate with a dual focus on software development and networking — building apps with Java/PHP/React while also working on network administration and infrastructure. He likes projects that sit at the intersection of \"build it\" and \"keep it running.\"",
      quickReplies: ['Skills', 'Projects', 'Availability']
    },
    {
      id: 'contact',
      keywords: ['contact', 'email', 'reach', 'hire', 'linkedin', 'phone', 'number', 'connect', 'talk', 'message'],
      response: "Best ways to reach him: email at <strong>mpilo.mndzebele9088@gmail.com</strong>, or via the <strong>LinkedIn</strong> and <strong>GitHub</strong> links in the Contact section below. There's also a contact form right on this page — scroll down to \"Let's talk.\"",
      quickReplies: ['Availability', 'Projects']
    },
    {
      id: 'availability',
      keywords: ['available', 'availability', 'hire', 'hiring', 'job', 'work', 'opportunity', 'opportunities', 'freelance', 'internship', 'remote', 'relocate', 'relocation'],
      response: "Yes — currently <strong>open to work</strong>: software development, network administration, or security analyst roles, plus internships and freelance work. Based in Mbabane, Eswatini, and open to remote &amp; relocation.",
      quickReplies: ['Contact', 'Skills']
    },
    {
      id: 'cv',
      keywords: ['cv', 'resume', 'download'],
      response: "There's a <strong>Download CV</strong> button at the top of the page (in the hero section) if you'd like the full PDF.",
      quickReplies: ['Contact', 'Experience']
    },
    {
      id: 'thanks',
      keywords: ['thanks', 'thank you', 'thx', 'cheers', 'appreciate'],
      response: "Anytime! Anything else you'd like to know about Mlamuli's work?",
      quickReplies: ['Projects', 'Contact']
    },
    {
      id: 'bot-meta',
      keywords: ['are you real', 'are you ai', 'are you a bot', 'chatbot', 'gpt', 'claude'],
      response: "I'm a lightweight FAQ bot built directly into this page — no external AI service, no data leaves your browser. I just match your question against Mlamuli's portfolio content.",
      quickReplies: ['Skills', 'Projects']
    }
  ];

  const FALLBACK_RESPONSE = "I'm not sure about that one — I can only answer questions about Mlamuli's skills, projects, certifications, experience, and contact info. Try one of the topics below, or reach him directly.";
  const FALLBACK_QUICK_REPLIES = ['Skills', 'Projects', 'Certifications', 'Contact'];

  // ---- Matching engine ------------------------------------------------
  function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function scoreIntent(userText, intent) {
    let score = 0;
    for (const kw of intent.keywords) {
      if (userText.includes(kw)) {
        // Longer/more specific keyword matches score higher
        score += kw.split(' ').length;
      }
    }
    return score;
  }

  function findBestIntent(rawText) {
    const text = normalize(rawText);
    if (!text) return null;

    let best = null;
    let bestScore = 0;
    for (const intent of INTENTS) {
      const score = scoreIntent(text, intent);
      if (score > bestScore) {
        bestScore = score;
        best = intent;
      }
    }
    return bestScore > 0 ? best : null;
  }

  function getResponse(userText) {
    const intent = findBestIntent(userText);
    if (intent) {
      return { html: intent.response, quickReplies: intent.quickReplies || [] };
    }
    return { html: FALLBACK_RESPONSE, quickReplies: FALLBACK_QUICK_REPLIES };
  }

  // ---- UI wiring --------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('chatbotToggle');
    const panel = document.getElementById('chatbotPanel');
    const closeBtn = document.getElementById('chatbotClose');
    const messages = document.getElementById('chatbotMessages');
    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatbotInput');
    const quickWrap = document.getElementById('chatbotQuickReplies');

    if (!toggle || !panel || !form || !input || !messages) return;

    let hasGreeted = false;
    let isOpen = false;

    function scrollToBottom() {
      messages.scrollTop = messages.scrollHeight;
    }

    function addMessage(html, sender) {
      const row = document.createElement('div');
      row.className = 'chatbot-msg chatbot-msg-' + sender;
      const bubble = document.createElement('div');
      bubble.className = 'chatbot-bubble';
      bubble.innerHTML = html;
      row.appendChild(bubble);
      messages.appendChild(row);
      scrollToBottom();
    }

    function setQuickReplies(list) {
      quickWrap.innerHTML = '';
      if (!list || !list.length) {
        quickWrap.hidden = true;
        return;
      }
      quickWrap.hidden = false;
      list.forEach(function (label) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chatbot-chip';
        chip.textContent = label;
        chip.addEventListener('click', function () {
          handleUserMessage(label);
        });
        quickWrap.appendChild(chip);
      });
    }

    function showTyping() {
      const row = document.createElement('div');
      row.className = 'chatbot-msg chatbot-msg-bot chatbot-typing-row';
      row.id = 'chatbotTypingRow';
      row.innerHTML = '<div class="chatbot-bubble chatbot-typing"><span></span><span></span><span></span></div>';
      messages.appendChild(row);
      scrollToBottom();
    }

    function hideTyping() {
      const row = document.getElementById('chatbotTypingRow');
      if (row) row.remove();
    }

    function handleUserMessage(text) {
      const trimmed = text.trim();
      if (!trimmed) return;
      addMessage(escapeHtml(trimmed), 'user');
      setQuickReplies([]);
      showTyping();

      const delay = 450 + Math.random() * 400;
      setTimeout(function () {
        hideTyping();
        const result = getResponse(trimmed);
        addMessage(result.html, 'bot');
        setQuickReplies(result.quickReplies);
      }, delay);
    }

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function openPanel() {
      isOpen = true;
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');

      if (!hasGreeted) {
        hasGreeted = true;
        showTyping();
        setTimeout(function () {
          hideTyping();
          addMessage("Hi, I'm " + BOT_NAME + " \uD83D\uDC4B Ask me about Mlamuli's skills, projects, certifications, or how to get in touch.", 'bot');
          setQuickReplies(['Skills', 'Projects', 'Certifications', 'Contact']);
        }, 500);
      }

      setTimeout(function () { input.focus(); }, 150);
    }

    function closePanel() {
      isOpen = false;
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (isOpen) { closePanel(); } else { openPanel(); }
    });

    closeBtn.addEventListener('click', closePanel);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closePanel();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const text = input.value;
      input.value = '';
      handleUserMessage(text);
    });
  });
})();
