(() => {
  const sports = {
    football: {
      label: "FOOTBALL FILM ROOM", field: "football", number: "12",
      players: [{ name: "Jordan Hayes", number: "12" }, { name: "Marcus Reed", number: "4" }, { name: "Eli Parker", number: "22" }, { name: "Cam Brooks", number: "81" }],
      play: [[.5,.73],[.27,.47],[.69,.51],[.39,.29],[.77,.32],[.18,.63],[.57,.43],[.85,.56]]
    },
    basketball: {
      label: "BASKETBALL FILM ROOM", field: "basketball", number: "3",
      players: [{ name: "Riley James", number: "3" }, { name: "Noah Ellis", number: "11" }, { name: "Avery Cole", number: "24" }, { name: "Kai Morgan", number: "7" }],
      play: [[.5,.62],[.3,.43],[.68,.42],[.34,.22],[.72,.25],[.19,.62],[.59,.34],[.83,.59]]
    },
    soccer: {
      label: "SOCCER FILM ROOM", field: "soccer", number: "10",
      players: [{ name: "Leo Navarro", number: "10" }, { name: "Sam Okafor", number: "7" }, { name: "Theo Martin", number: "9" }, { name: "Alex Kim", number: "21" }],
      play: [[.5,.72],[.3,.44],[.67,.48],[.38,.26],[.77,.31],[.18,.64],[.58,.39],[.86,.55]]
    }
  };
  const roundsPerGame = 5;
  const canvas = document.querySelector("#play-canvas");
  const ctx = canvas.getContext("2d");
  const buttons = [...document.querySelectorAll(".sport-tab")];
  const choices = document.querySelector("#choices");
  const nextButton = document.querySelector("#next-button");
  const duration = 6500;
  let sport = "football";
  let round = 0;
  let score = 0;
  let targetIndex = 0;
  let answered = false;
  let gameComplete = false;
  let clipStart = performance.now();
  let clipProgress = 0;
  let results = [];
  let roster = [];

  function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function currentSport() { return sports[sport]; }

  function startRound() {
    answered = false;
    clipStart = performance.now();
    clipProgress = 0;
    const data = currentSport();
    const previous = Number(data.number);
    const alternatives = data.players.filter(player => Number(player.number) !== previous);
    const carrier = alternatives[Math.floor(Math.random() * alternatives.length)];
    data.number = carrier.number;
    roster = shuffle(data.players);
    targetIndex = data.players.indexOf(carrier);
    document.querySelector("#round-label").textContent = String(round + 1).padStart(2, "0");
    document.querySelector("#round-kicker").textContent = `ROUND ${round + 1} OF ${roundsPerGame}  ·  CHOOSE ONE`;
    document.querySelector("#sport-label").textContent = data.label;
    document.querySelector("#mask-number").textContent = `#${carrier.number}`;
    document.querySelector(".canvas-badge").innerHTML = `PLAY ${String(round + 1).padStart(2, "0")} &nbsp; / &nbsp; ${sport === "football" ? "END ZONE CAM" : sport === "basketball" ? "COURTSIDE CAM" : "TOUCHLINE CAM"}`;
    document.querySelector("#play-canvas").setAttribute("aria-label", `Animated ${sport} play with player number ${carrier.number} blacked out`);
    document.querySelector("#feedback").textContent = "Make your pick to lock in your answer.";
    document.querySelector("#feedback").className = "feedback";
    nextButton.disabled = true;
    nextButton.innerHTML = 'Next play <span class="next-arrow" aria-hidden="true">›</span>';
    renderChoices();
    renderDots();
  }

  function renderChoices() {
    choices.replaceChildren();
    roster.forEach((player, index) => {
      const button = document.createElement("button");
      button.className = "choice";
      button.type = "button";
      button.dataset.number = player.number;
      button.setAttribute("aria-label", `${String.fromCharCode(65 + index)}: ${player.name}, number ${player.number}`);
      button.innerHTML = `<span class="choice-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span><span class="choice-name"></span><span class="choice-number">#${player.number}</span>`;
      button.querySelector(".choice-name").textContent = player.name;
      button.addEventListener("click", () => answer(player, button));
      choices.append(button);
    });
  }

  function answer(player, selectedButton) {
    if (answered) return;
    answered = true;
    const correct = player.number === currentSport().players[targetIndex].number;
    results.push(correct);
    if (correct) score++;
    choices.querySelectorAll(".choice").forEach(button => {
      button.disabled = true;
      if (button.dataset.number === currentSport().players[targetIndex].number) button.classList.add("correct");
    });
    if (!correct) selectedButton.classList.add("incorrect");
    const feedback = document.querySelector("#feedback");
    feedback.className = `feedback ${correct ? "is-correct" : "is-wrong"}`;
    feedback.textContent = correct ? "That's your player. Great read." : `Not quite. #${currentSport().players[targetIndex].number} is ${currentSport().players[targetIndex].name}.`;
    document.querySelector("#score-label").textContent = `${score} / ${results.length}`;
    document.querySelector("#header-score").textContent = String(score * 100);
    renderDots();
    nextButton.disabled = false;
    if (round === roundsPerGame - 1) nextButton.innerHTML = 'See results <span class="next-arrow" aria-hidden="true">›</span>';
  }

  function renderDots() {
    const dots = document.querySelector("#round-dots");
    dots.replaceChildren();
    for (let index = 0; index < roundsPerGame; index++) {
      const dot = document.createElement("span");
      dot.className = `round-dot${results[index] === true ? " done" : results[index] === false ? " miss" : ""}`;
      dots.append(dot);
    }
  }

  function showResults() {
    gameComplete = true;
    choices.replaceChildren();
    const message = document.createElement("p");
    message.style.cssText = "grid-column: 1 / -1; margin: 0; padding: 15px 12px; border: 1px solid #354038; color: #d9fa62; text-align: center; font-size: 14px; font-weight: 700;";
    message.textContent = score >= 4 ? "Elite vision. You know the game." : score >= 2 ? "Solid read. Run it back?" : "The film room is open. One more round?";
    choices.append(message);
    document.querySelector("#round-kicker").textContent = "FINAL WHISTLE  ·  GAME COMPLETE";
    document.querySelector("h2").textContent = `${score} / ${roundsPerGame} correct`;
    document.querySelector(".question-copy").textContent = "Switch sports above for a fresh game, or play this one again.";
    document.querySelector("#feedback").textContent = "Your score is saved for this session.";
    document.querySelector("#feedback").className = "feedback";
    nextButton.disabled = false;
    nextButton.innerHTML = 'Play again <span class="next-arrow" aria-hidden="true">↺</span>';
  }

  function advance() {
    if (gameComplete) {
      round = 0;
      results = [];
      score = 0;
      gameComplete = false;
      document.querySelector("#score-label").textContent = "0 / 0";
      document.querySelector("#header-score").textContent = "0";
      document.querySelector("h2").textContent = "Who has the ball?";
      document.querySelector(".question-copy").textContent = "The player is blacked out. Use the highlighted jersey number to make your call.";
      startRound();
      return;
    }
    if (round >= roundsPerGame - 1) {
      showResults();
      return;
    }
    round++;
    startRound();
  }

  function chooseSport(nextSport) {
    sport = nextSport;
    round = 0;
    score = 0;
    results = [];
    gameComplete = false;
    buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.sport === sport)));
    document.querySelector("#score-label").textContent = "0 / 0";
    document.querySelector("#header-score").textContent = "0";
    document.querySelector("h2").textContent = "Who has the ball?";
    document.querySelector(".question-copy").textContent = "The player is blacked out. Use the highlighted jersey number to make your call.";
    startRound();
  }

  buttons.forEach(button => button.addEventListener("click", () => chooseSport(button.dataset.sport)));
  nextButton.addEventListener("click", advance);
  document.querySelector("#replay-button").addEventListener("click", () => {
    clipStart = performance.now();
    clipProgress = 0;
    document.querySelector("#clip-hint").textContent = "Clip replaying. Follow the highlighted jersey.";
  });

  function resizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bounds.width * ratio);
    canvas.height = Math.round(bounds.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function line(x1, y1, x2, y2, color, width = 1, dash = []) {
    ctx.beginPath();
    ctx.setLineDash(dash);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function paintField(width, height) {
    const field = currentSport().field;
    if (field === "football") {
      ctx.fillStyle = "#214a38";
      ctx.fillRect(0, 0, width, height);
      for (let index = 0; index < 9; index++) {
        ctx.fillStyle = index % 2 ? "#204634" : "#27503a";
        ctx.fillRect(index * width / 9, 0, width / 9, height);
      }
      for (let index = 0; index <= 10; index++) {
        const x = index * width / 10;
        line(x, 0, x, height, "#d3e1cc25", index % 5 === 0 ? 1.5 : 1);
        if (index < 10) {
          for (let mark = 0; mark < 3; mark++) {
            const y = height * (.34 + mark * .16);
            line(x + 2, y, x + 9, y, "#d3e1cc38", 1);
          }
        }
      }
      line(0, height * .075, width, height * .075, "#e9eddd85", 2);
      ctx.fillStyle = "#f1f2e9a8";
      ctx.font = "800 11px 'DM Sans', sans-serif";
      ctx.fillText("2ND & 6", 14, height * .17);
    } else if (field === "basketball") {
      ctx.fillStyle = "#794b34";
      ctx.fillRect(0, 0, width, height);
      for (let y = 0; y < 12; y++) line(0, y * height / 11, width, y * height / 11, "#dcaf823b", 1);
      ctx.fillStyle = "#d4a47415";
      ctx.fillRect(width * .08, height * .08, width * .84, height * .84);
      ctx.strokeStyle = "#f4e4cb8c";
      ctx.lineWidth = 2;
      ctx.strokeRect(width * .07, height * .07, width * .86, height * .86);
      line(width * .5, height * .07, width * .5, height * .93, "#f4e4cb8c", 2);
      ctx.beginPath(); ctx.arc(width * .5, height * .5, height * .13, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(width * .93, height * .5, height * .16, Math.PI * .65, Math.PI * 1.35); ctx.stroke();
      line(width * .91, height * .43, width * .91, height * .57, "#f4e4cb8c", 2);
      ctx.beginPath(); ctx.arc(width * .9, height * .5, height * .04, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(width * .07, height * .5, height * .16, -Math.PI * .35, Math.PI * .35); ctx.stroke();
    } else {
      ctx.fillStyle = "#215139";
      ctx.fillRect(0, 0, width, height);
      for (let index = 0; index < 8; index++) {
        ctx.fillStyle = index % 2 ? "#204d37" : "#28583c";
        ctx.fillRect(0, index * height / 8, width, height / 8);
      }
      ctx.strokeStyle = "#dce8d5a0"; ctx.lineWidth = 1.5;
      ctx.strokeRect(width * .06, height * .07, width * .88, height * .86);
      line(width * .5, height * .07, width * .5, height * .93, "#dce8d5a0", 1.5);
      ctx.beginPath(); ctx.arc(width * .5, height * .5, height * .12, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeRect(width * .78, height * .28, width * .16, height * .44);
      ctx.strokeRect(width * .86, height * .4, width * .08, height * .2);
      ctx.strokeRect(width * .06, height * .28, width * .16, height * .44);
      ctx.strokeRect(width * .06, height * .4, width * .08, height * .2);
    }
    const shade = ctx.createLinearGradient(0, 0, width, height);
    shade.addColorStop(0, "#05130a16"); shade.addColorStop(1, "#04080b52");
    ctx.fillStyle = shade; ctx.fillRect(0, 0, width, height);
  }

  function paintPlayer(x, y, scale, player, isCarrier, phase) {
    const radius = Math.max(8, canvas.getBoundingClientRect().height * .042 * scale);
    const shirt = player.side === "away" ? "#e8e5d9" : "#e2ebce";
    const shorts = player.side === "away" ? "#303746" : "#25322b";
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(Math.sin(phase * 2 + player.offset) * .045);
    ctx.fillStyle = "#09110d57";
    ctx.beginPath(); ctx.ellipse(1, radius * 2.2, radius * 1.1, radius * .38, 0, 0, Math.PI * 2); ctx.fill();
    if (isCarrier) {
      ctx.shadowColor = "#d9fa62a0"; ctx.shadowBlur = 12;
      ctx.fillStyle = "#d9fa6224";
      ctx.beginPath(); ctx.arc(0, 0, radius * 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    const bodyWidth = radius * .88;
    const bodyHeight = radius * 1.85;
    ctx.strokeStyle = shorts; ctx.lineWidth = Math.max(3, radius * .42); ctx.lineCap = "round";
    const stride = Math.sin(phase * 7 + player.offset) * radius * .36;
    ctx.beginPath(); ctx.moveTo(-radius * .22, radius * 1.1); ctx.lineTo(-radius * .34 + stride, radius * 1.85); ctx.moveTo(radius * .22, radius * 1.1); ctx.lineTo(radius * .34 - stride, radius * 1.85); ctx.stroke();
    if (isCarrier) {
      ctx.fillStyle = "#080a09";
      ctx.beginPath(); ctx.roundRect(-bodyWidth * .74, -radius * .52, bodyWidth * 1.48, bodyHeight * 1.12, radius * .12); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -radius * 1.05, radius * .42, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#080a09"; ctx.lineWidth = Math.max(4, radius * .45);
      ctx.beginPath(); ctx.moveTo(-radius * .3, radius * .05); ctx.lineTo(-radius * .86, radius * .48); ctx.moveTo(radius * .3, radius * .05); ctx.lineTo(radius * .62, radius * .45); ctx.stroke();
      ctx.fillStyle = "#d9fa62"; ctx.beginPath(); ctx.roundRect(-radius * 1.42, -radius * .17, radius * .83, radius * .52, 2); ctx.fill();
      ctx.fillStyle = "#111810"; ctx.font = `800 ${Math.max(7, radius * .36)}px 'DM Sans', sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(player.number, -radius * 1.01, radius * .09);
    } else {
      ctx.fillStyle = shirt; ctx.beginPath(); ctx.roundRect(-bodyWidth / 2, -radius * .5, bodyWidth, bodyHeight, radius * .22); ctx.fill();
      ctx.fillStyle = player.side === "away" ? "#303746" : "#25322b"; ctx.beginPath(); ctx.arc(0, -radius * 1.05, radius * .39, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = shirt; ctx.lineWidth = Math.max(3, radius * .38);
      ctx.beginPath(); ctx.moveTo(-radius * .3, 0); ctx.lineTo(-radius * .72, radius * .48); ctx.moveTo(radius * .3, 0); ctx.lineTo(radius * .7, radius * .42); ctx.stroke();
      ctx.fillStyle = player.side === "away" ? "#313b4d" : "#344438"; ctx.font = `800 ${Math.max(7, radius * .39)}px 'DM Sans', sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(player.number, 0, radius * .05);
    }
    ctx.restore();
  }

  function paintBall(x, y, field, size) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-.45);
    if (field === "football") {
      ctx.fillStyle = "#b26432"; ctx.beginPath(); ctx.ellipse(0, 0, size * 1.1, size * .63, 0, 0, Math.PI * 2); ctx.fill();
      line(-size * .18, -size * .3, size * .18, size * .3, "#f7dfbc", 1.2); line(-size * .5, -size * .03, size * .5, size * .03, "#f7dfbc", .8);
    } else if (field === "basketball") {
      ctx.fillStyle = "#ed873f"; ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#513522"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, size, -.9, .9); ctx.stroke(); line(-size, 0, size, 0, "#513522", 1);
    } else {
      ctx.fillStyle = "#f0f0e7"; ctx.beginPath(); ctx.arc(0, 0, size * .8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#253c31"; ctx.beginPath(); ctx.arc(0, 0, size * .3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function draw(timestamp) {
    requestAnimationFrame(draw);
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    if (canvas.width !== Math.round(bounds.width * Math.min(window.devicePixelRatio || 1, 2))) resizeCanvas();
    const width = bounds.width;
    const height = bounds.height;
    if (timestamp - clipStart >= duration) clipStart = timestamp;
    clipProgress = Math.min((timestamp - clipStart) / duration, 1);
    const phase = clipProgress;
    ctx.clearRect(0, 0, width, height);
    paintField(width, height);
    const data = currentSport();
    const route = data.play;
    const carrierPath = route[targetIndex % route.length];
    const startX = width * .48;
    const startY = height * .55;
    const endX = width * (.2 + carrierPath[0] * .62);
    const endY = height * (.16 + carrierPath[1] * .69);
    const eased = phase * phase * (3 - 2 * phase);
    const posX = startX + (endX - startX) * eased;
    const posY = startY + (endY - startY) * eased;
    const allPositions = [];
    for (let index = 0; index < 8; index++) {
      if (index === targetIndex) {
        allPositions.push({ x: posX, y: posY, number: data.players[index].number, side: index % 2 ? "away" : "home", offset: index * .8, carrier: true });
        continue;
      }
      const base = route[index];
      const spread = index % 2 ? -1 : 1;
      const drift = Math.sin(phase * 4 + index * 1.8) * height * .022;
      const x = width * (.12 + base[0] * .76) + Math.cos(phase * 3 + index) * width * .018;
      const y = height * (.15 + base[1] * .72) + drift + phase * spread * height * .055;
      allPositions.push({ x, y, number: data.players[index % data.players.length].number, side: index % 3 === 0 ? "away" : "home", offset: index * .73, carrier: false });
    }
    allPositions.sort((first, second) => first.y - second.y);
    const scaleBase = Math.max(.68, Math.min(1.15, height / 240));
    allPositions.forEach(player => {
      paintPlayer(player.x, player.y, scaleBase, player, player.carrier, phase);
      if (player.carrier) {
        const ballOffset = sport === "basketball" ? height * .045 + Math.abs(Math.sin(phase * 16)) * height * .035 : height * .035;
        paintBall(player.x + height * .034, player.y - height * .015 + ballOffset, data.field, Math.max(3, height * .017));
      }
    });
    ctx.strokeStyle = `rgba(217,250,98,${.48 + Math.sin(timestamp / 250) * .12})`; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.ellipse(posX, posY, height * .06, height * .13, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    document.querySelector("#scrubber-fill").style.width = `${phase * 100}%`;
  }

  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(canvas);
  window.addEventListener("resize", resizeCanvas);
  startRound();
  resizeCanvas();
  requestAnimationFrame(draw);
})();
