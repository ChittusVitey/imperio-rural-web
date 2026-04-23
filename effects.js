// effects.js — alinhado à paleta do Império Rural (index.html)

(function () {

    /** Cores espelhando :root no CSS (mantém efeitos coerentes com menu / HUD) */
    const FX = {
      forest: "#3d5c3a",
      forestDeep: "#1e2e1c",
      green: "#5a8f52",
      greenBright: "#7db86a",
      greenSoft: "#a8c090",
      gold: "#c9a44a",
      goldLight: "#e8d18a",
      goldDark: "#8f7028",
      cream: "#fffef7",
      creamDark: "#efe6d4",
      danger: "#c45c48",
      dangerDeep: "#a63d32",
      wood: "#7a5c42",
      confettiA: "#c9a44a",
      confettiB: "#e8d18a",
      confettiC: "#8fb87a",
      confettiD: "#5a8f52",
      confettiE: "#b8704a",
      confettiF: "#d4c4a8",
    };

    // ===== AUDIO ENGINE (FIXED) =====
    let audioCtx = null;
  
    function getAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    }
  
    function playSound(freq = 400, duration = 0.1, type = "triangle", volume = 0.2) {
      try {
        const ctx = getAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
  
        osc.type = type;
        osc.frequency.value = freq;
  
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
        osc.connect(gain);
        gain.connect(ctx.destination);
  
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {}
    }

    function playRollingNoise(duration = 0.5, volume = 0.12) {
      try {
        const ctx = getAudio();
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.6;
        }

        const source = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        source.buffer = buffer;
        filter.type = "bandpass";
        filter.frequency.value = 820;
        filter.Q.value = 0.9;

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
        source.stop(ctx.currentTime + duration);
      } catch (e) {}
    }
  
    // ===== OVERLAY =====
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "9999";
    document.body.appendChild(overlay);
  
    function getPos(el) {
      if (!el || !el.getBoundingClientRect) {
        return { x: innerWidth / 2, y: innerHeight / 2 };
      }
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
  
    // ===== FLOAT TEXT =====
    function floatText(text, color, x, y) {
      const el = document.createElement("div");
      el.textContent = text;
      el.style.position = "fixed";
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.transform = "translate(-50%, -50%)";
      el.style.fontFamily = '"DM Sans", "Segoe UI", system-ui, sans-serif';
      el.style.fontWeight = "800";
      el.style.fontSize = "19px";
      el.style.letterSpacing = "0.02em";
      el.style.color = color;
      el.style.textShadow = "0 1px 2px rgba(12, 18, 10, 0.35), 0 0 12px rgba(255, 252, 245, 0.35)";
      el.style.transition = "all 0.8s ease-out";
      overlay.appendChild(el);
  
      requestAnimationFrame(() => {
        el.style.transform = "translate(-50%, -90px)";
        el.style.opacity = "0";
      });
  
      setTimeout(() => el.remove(), 800);
    }
  
    // ===== PARTICLES =====
    function burst(x, y, color, amount = 10) {
      for (let i = 0; i < amount; i++) {
        const p = document.createElement("div");
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 50;
  
        p.style.position = "fixed";
        p.style.left = x + "px";
        p.style.top = y + "px";
        p.style.width = "8px";
        p.style.height = "8px";
        p.style.borderRadius = "50%";
        p.style.background = color;
        p.style.transition = "all 0.6s ease-out";
  
        overlay.appendChild(p);
  
        requestAnimationFrame(() => {
          p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
          p.style.opacity = "0";
        });
  
        setTimeout(() => p.remove(), 600);
      }
    }
  
    // ===== SCREEN SHAKE =====
    function shake(intensity = 5, duration = 180) {
      let start = Date.now();
      function anim() {
        let p = (Date.now() - start) / duration;
        if (p < 1) {
          document.body.style.transform =
            `translate(${(Math.random() - 0.5) * intensity}px, ${(Math.random() - 0.5) * intensity}px)`;
          requestAnimationFrame(anim);
        } else {
          document.body.style.transform = "";
        }
      }
      anim();
    }
  
    // ===== FLASH =====
    function flash(el, color = FX.goldLight) {
      if (!el) return;
  
      const f = document.createElement("div");
      f.style.position = "absolute";
      f.style.inset = "0";
      f.style.borderRadius = "18px";
      f.style.background = `radial-gradient(circle, ${color}, transparent)`;
      f.style.opacity = "0.9";
      f.style.animation = "fxFlash 0.5s forwards";
  
      el.appendChild(f);
      setTimeout(() => f.remove(), 500);
    }

    function confettiBurst(x, y, amount = 45) {
      const palette = [
        FX.confettiA,
        FX.confettiB,
        FX.confettiC,
        FX.confettiD,
        FX.confettiE,
        FX.confettiF,
        FX.creamDark,
      ];
      for (let i = 0; i < amount; i++) {
        const c = document.createElement("div");
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 120;
        const size = 6 + Math.random() * 7;
        c.style.position = "fixed";
        c.style.left = x + "px";
        c.style.top = y + "px";
        c.style.width = size + "px";
        c.style.height = Math.max(4, size * 0.65) + "px";
        c.style.background = palette[Math.floor(Math.random() * palette.length)];
        c.style.borderRadius = "2px";
        c.style.pointerEvents = "none";
        c.style.opacity = "1";
        c.style.transition = "transform 0.95s cubic-bezier(.2,.75,.35,1), opacity 0.95s linear";
        c.style.transform = "translate(-50%, -50%) rotate(0deg)";
        overlay.appendChild(c);

        requestAnimationFrame(() => {
          const tx = Math.cos(angle) * dist;
          const ty = Math.sin(angle) * dist + 50 + Math.random() * 45;
          const rot = -340 + Math.random() * 680;
          c.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
          c.style.opacity = "0";
        });
        setTimeout(() => c.remove(), 1000);
      }
    }

    function showRollingDice(anchorEl, d1, d2, onDone) {
      const faces = ["\u2680", "\u2681", "\u2682", "\u2683", "\u2684", "\u2685"];
      const wrap = document.createElement("div");
      wrap.className = "fx-dice-roll";
      const anchor = anchorEl && anchorEl.getBoundingClientRect ? anchorEl.getBoundingClientRect() : null;
      if (anchor) {
        wrap.style.left = (anchor.left + anchor.width / 2) + "px";
        wrap.style.top = (anchor.bottom + 10) + "px";
        wrap.style.transform = "translate(-50%, 0)";
      } else {
        wrap.style.left = "50%";
        wrap.style.top = "50%";
        wrap.style.transform = "translate(-50%, -50%)";
      }

      const dA = document.createElement("div");
      const dB = document.createElement("div");
      dA.className = "fx-die";
      dB.className = "fx-die";
      wrap.appendChild(dA);
      wrap.appendChild(dB);
      overlay.appendChild(wrap);

      let ticks = 0;
      const timer = setInterval(() => {
        dA.textContent = faces[Math.floor(Math.random() * 6)];
        dB.textContent = faces[Math.floor(Math.random() * 6)];
        dA.style.transform = `rotate(${(Math.random() - 0.5) * 24}deg)`;
        dB.style.transform = `rotate(${(Math.random() - 0.5) * 24}deg)`;
        ticks++;
        if (ticks >= 9) {
          clearInterval(timer);
          dA.textContent = faces[Math.max(1, Math.min(6, d1 || 1)) - 1];
          dB.textContent = faces[Math.max(1, Math.min(6, d2 || 1)) - 1];
          wrap.classList.add("final");
          setTimeout(() => {
            wrap.classList.add("fade");
            setTimeout(() => {
              wrap.remove();
              if (typeof onDone === "function") onDone();
            }, 260);
          }, 260);
        }
      }, 55);
    }
  
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fxFlash {
        0% { transform: scale(0.85); opacity: 1; }
        100% { transform: scale(1.55); opacity: 0; }
      }
      .fx-dice-roll {
        position: fixed;
        display: flex;
        gap: 16px;
        padding: 14px 16px;
        border-radius: 16px;
        background: linear-gradient(165deg, rgba(255, 254, 247, 0.96) 0%, rgba(232, 222, 191, 0.94) 100%);
        border: 1px solid rgba(143, 112, 40, 0.35);
        box-shadow:
          0 20px 48px rgba(12, 18, 10, 0.35),
          0 0 0 1px rgba(255, 252, 245, 0.5) inset;
      }
      .fx-dice-roll.fade {
        opacity: 0;
        transition: opacity 0.24s linear;
      }
      .fx-die {
        width: 58px;
        height: 58px;
        border-radius: 12px;
        background: linear-gradient(165deg, #fffef9 0%, #efe6d4 100%);
        color: #2c2218;
        border: 1px solid rgba(90, 70, 48, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65), 0 4px 14px rgba(28, 22, 16, 0.12);
        transition: transform 0.08s ease;
      }
      .fx-dice-roll.final .fx-die {
        transform: scale(1.05);
        border-color: rgba(201, 164, 74, 0.55);
      }
    `;
    document.head.appendChild(style);
  
    // ===== INPUT SOUND (desktop + mobile) =====
    document.addEventListener("pointerover", (e) => {
      if (e.pointerType !== "touch" && e.target && e.target.tagName === "BUTTON") {
        playSound(300, 0.03);
      }
    });

    let lastTapSoundAt = 0;
    document.addEventListener("pointerdown", () => {
      const now = Date.now();
      if (now - lastTapSoundAt < 70) return;
      lastTapSoundAt = now;
      playSound(500, 0.03);
    }, { passive: true });
  
    // ===== API =====
    window.Effects = {
  
      moneyGain(v, el) {
        const { x, y } = getPos(el);
        const c = FX.greenBright;
        floatText("+" + v, c, x, y);
        burst(x, y, c);
        playSound(700, 0.1);
      },
  
      moneyLose(v, el) {
        const { x, y } = getPos(el);
        const c = FX.danger;
        floatText("-" + v, c, x, y);
        burst(x, y, c);
        playSound(150, 0.12, "sawtooth");
        shake();
      },
  
      resourceGain(type, v, el) {
        const icons = { trigo: "🌾", gado: "🐄" };
        const burstColor = type === "gado" ? FX.gold : FX.greenBright;
        const textColor = type === "gado" ? FX.goldDark : FX.forest;
        const { x, y } = getPos(el);
        floatText(`${icons[type]} ${v > 0 ? "+" : ""}${v}`, textColor, x, y);
        burst(x, y, burstColor);
        playSound(500, 0.08);
      },
  
      purchase(el) {
        const { x, y } = getPos(el);
  
        for (let i = 0; i < 3; i++) {
          setTimeout(() => burst(x, y, FX.gold, 12), i * 100);
        }
  
        flash(el, FX.goldLight);
  
        // som tipo recompensa
        playSound(600, 0.08);
        setTimeout(() => playSound(800, 0.08), 80);
        setTimeout(() => playSound(1000, 0.1), 160);
      },
  
      propertyBought(el, color = FX.gold) {
        const { x, y } = getPos(el);
        const confettiAmount = Math.max(26, Math.floor(Math.min(innerWidth, innerHeight) / 14));
        confettiBurst(x, y, confettiAmount);
        flash(el, color + "99");
        if (el) {
          el.style.transition = "box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease";
          el.style.borderColor = color;
          el.style.transform = "scale(1.06)";
          el.style.boxShadow = `0 0 0 4px ${color}, 0 0 0 8px ${color}66, 0 22px 78px ${color}CC, 0 0 34px ${color}, inset 0 0 0 2px rgba(255,252,245,0.7)`;
          setTimeout(() => {
            if (el) el.style.transform = "";
          }, 260);
        }
        playSound(620, 0.08, "triangle");
        setTimeout(() => playSound(920, 0.1, "triangle"), 80);
      },

      moveStep() {
        playSound(210 + Math.random() * 50, 0.025, "sine", 0.09);
      },

      dice(el, d1, d2, anchorEl, onDone) {
        if (el) {
          el.style.transform = "scale(1.3) rotate(8deg)";
          setTimeout(() => el.style.transform = "scale(1)", 200);
        }
  
        showRollingDice(anchorEl, d1, d2, onDone);
        playRollingNoise(0.55, 0.12);
        let i = 0;
        const roll = setInterval(() => {
          playSound(200 + Math.random() * 320, 0.03, "square", 0.11);
          i++;
          if (i > 7) clearInterval(roll);
        }, 45);
      },
  
      bigWin(v, el) {
        const { x, y } = getPos(el);
  
        for (let i = 0; i < 5; i++) {
          setTimeout(() => burst(x, y, FX.goldLight, 15), i * 80);
        }
  
        floatText("+" + v, FX.goldDark, x, y);
  
        playSound(700, 0.1);
        setTimeout(() => playSound(900, 0.1), 100);
        setTimeout(() => playSound(1200, 0.12), 200);
      }
  
    };
  
  })();
