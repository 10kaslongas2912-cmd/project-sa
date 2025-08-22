import React, { useEffect, useMemo, useRef, useState } from "react";
import "./style.css";
import { visa, amex, mastercard, discover, troy, chip, backgrounds } from "../../../assets/sponsor/payment/creditcard";

const amexMask = "#### ###### #####";
const otherMask = "#### #### #### ####";

type CardType = "visa" | "amex" | "mastercard" | "discover" | "troy";

function detectCardType(cardNumber: string): CardType {
  const n = cardNumber;
  if (/^4/.test(n)) return "visa";
  if (/^(34|37)/.test(n)) return "amex";
  if (/^5[1-5]/.test(n)) return "mastercard";
  if (/^6011/.test(n)) return "discover";
  if (/^9792/.test(n)) return "troy";
  return "visa";
}

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}
function applyMask(digits: string, mask: string) {
  const out: string[] = [];
  let di = 0;
  for (let i = 0; i < mask.length; i++) {
    const m = mask[i];
    if (m === "#") {
      if (di < digits.length) out.push(digits[di++]);
      else break;
    } else {
      if (di < digits.length) out.push(m);
    }
  }
  return out.join("");
}

export default function CreditCardForm() {
  const [currentCardBackground] = useState<number>(() => Math.floor(Math.random() * 25 + 1));
  const [cardName, setCardName] = useState("");
  const [cardNumberRaw, setCardNumberRaw] = useState("");
  const [cardMonth, setCardMonth] = useState("");
  const [cardYear, setCardYear] = useState<number | "">("");
  const [cardCvv, setCardCvv] = useState("");

  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isFlipAnimating, setIsFlipAnimating] = useState(false);      // <<-- FLAG รออนิเมชัน
  const pendingTargetRef = useRef<HTMLElement | null>(null);          // <<-- คิว target ที่จะโฟกัสหลัง flip
  const [focusStyle, setFocusStyle] = useState<{ width: string; height: string; transform: string } | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const minCardYear = useMemo(() => new Date().getFullYear(), []);
  const years = useMemo(() => Array.from({ length: 12 }, (_, i) => minCardYear + i), [minCardYear]);

  const cardType = useMemo(() => detectCardType(cardNumberRaw), [cardNumberRaw]);
  const numberMask = useMemo(() => (cardType === "amex" ? amexMask : otherMask), [cardType]);
  const maxDigits = useMemo(() => (cardType === "amex" ? 15 : 16), [cardType]);
  const cardNumberFormatted = useMemo(() => applyMask(cardNumberRaw, numberMask), [cardNumberRaw, numberMask]);

  const minCardMonth = useMemo(() => {
    if (cardYear === minCardYear) return new Date().getMonth() + 1;
    return 1;
  }, [cardYear, minCardYear]);

  // refs
  const cardRef = useRef<HTMLDivElement | null>(null);   // .card-item
  const frontRef = useRef<HTMLDivElement | null>(null);  // .card-item__side.-front
  const focusBoxRef = useRef<HTMLDivElement | null>(null); // .card-item__focus
  const formRef = useRef<HTMLDivElement | null>(null);

  const refMap = {
    cardNumber: useRef<HTMLLabelElement | null>(null),
    cardName: useRef<HTMLLabelElement | null>(null),
    cardDate: useRef<HTMLDivElement | null>(null),
  };

  useEffect(() => {
    (document.getElementById("cardNumber") as HTMLInputElement | null)?.focus();
  }, []);

  useEffect(() => {
    if (cardMonth) {
      const m = parseInt(cardMonth, 10);
      if (m < minCardMonth) setCardMonth("");
    }
  }, [minCardMonth, cardMonth]);

  // รอ transition จบ → ปลด flag + ถ้ามี target pending ให้คำนวณกรอบ
  useEffect(() => {
    const el = frontRef.current;
    if (!el) return;
    const onEnd = (ev: TransitionEvent) => {
      if (ev.propertyName !== "transform") return;
      setIsFlipAnimating(false);
      const t = pendingTargetRef.current;
      if (t) {
        pendingTargetRef.current = null;
        requestAnimationFrame(() => computeFocusRect(t));
      }
    };
    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, []);

  // คลิกนอกฟอร์ม/การ์ด → ล้างกรอบ
  useEffect(() => {
    function onDown(e: PointerEvent) {
      const t = e.target as Node;
      if (!formRef.current?.contains(t) && !cardRef.current?.contains(t)) clearFocus();
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = onlyDigits(e.target.value);
    setCardNumberRaw(digits.slice(0, maxDigits));
  }
  function handleCvvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = onlyDigits(e.target.value).slice(0, 4);
    setCardCvv(digits);
  }

  function computeFocusRect(targetEl: HTMLElement) {
    const origin = (focusBoxRef.current?.offsetParent as HTMLElement) || frontRef.current || cardRef.current;
    if (!origin) return;
    const t = targetEl.getBoundingClientRect();
    const o = origin.getBoundingClientRect();
    setFocusStyle({
      width: `${t.width}px`,
      height: `${t.height}px`,
      transform: `translate(${Math.round(t.left - o.left)}px, ${Math.round(t.top - o.top)}px)`,
    });
  }

  function clearFocus() {
    setIsInputFocused(false);
    setFocusStyle(null);
  }
  function blurInput() {
    setIsInputFocused(false);
    setTimeout(() => {
      if (!isInputFocused) setFocusStyle(null);
    }, 200);
  }

  // >>> โฟกัส: ถ้ากำลัง flip อยู่ ให้ "คิว" ไว้ก่อน รอ transitionend ค่อยคำนวณ
  function focusInput(e: React.FocusEvent<HTMLElement>) {
    setIsInputFocused(true);
    const key = (e.currentTarget.getAttribute("data-ref") || "") as keyof typeof refMap;
    const target = refMap[key]?.current as HTMLElement | null;
    if (!target) return;

    const run = () => requestAnimationFrame(() => computeFocusRect(target));

    if (isCardFlipped || isFlipAnimating) {
      // กลับมาหน้าหน้า และตั้งคิว
      pendingTargetRef.current = target;
      setIsCardFlipped(false);
      setIsFlipAnimating(true);
      return;
    }
    run();
  }

  // แสดงตัวเลขด้วย span เดิม (คงโค้ดคุณไว้)
  const numberSlots = useMemo(() => {
    const mask = numberMask.split("");
    const digits = cardNumberFormatted.split("");
    const arr: { char: string; hide: boolean; active: boolean; key: number }[] = [];
    for (let i = 0; i < mask.length; i++) {
      const m = mask[i];
      if (m === "#") {
        const ch = i < digits.length ? digits[i] : "";
        const hasVal = ch !== "";
        const isAmex = cardType === "amex";
        const hide = isAmex ? i > 4 && i < 14 && hasVal : i > 4 && i < 15 && hasVal;
        arr.push({ char: hasVal ? ch : "#", hide, active: m.trim() === "", key: i });
      } else {
        const ch = i < digits.length ? m : m;
        arr.push({ char: ch, hide: false, active: m.trim() === "", key: i });
      }
    }
    return arr;
  }, [numberMask, cardNumberFormatted, cardType]);

  return (
    <div className="wrapper" id="app">
      <div className="card-form">
        <div className="card-list">
          <div className={`card-item ${isCardFlipped ? "-active" : ""}`} ref={cardRef}>
            {/* Front */}
            <div className="card-item__side -front" ref={frontRef}>
              <div
                className={`card-item__focus ${focusStyle ? "-active" : ""}`}
                ref={focusBoxRef}
                style={focusStyle ?? undefined}
              />
              <div className="card-item__cover">
                <img src={backgrounds[currentCardBackground - 1]} className="card-item__bg" />
              </div>

              <div className="card-item__wrapper">
                <div className="card-item__top">
                  <img src={chip} className="card-item__chip" />
                  <div className="card-item__type">
                    {cardType && (
                      <img
                        src={
                          cardType === "visa"
                            ? visa
                            : cardType === "amex"
                            ? amex
                            : cardType === "mastercard"
                            ? mastercard
                            : cardType === "discover"
                            ? discover
                            : troy
                        }
                        className="card-item__typeImg"
                        alt={cardType}
                      />
                    )}
                  </div>
                </div>

                <label htmlFor="cardNumber" className="card-item__number" ref={refMap.cardNumber}>
                  {numberSlots.map((slot) => (
                    <span key={slot.key}>
                      <div className={`card-item__numberItem${slot.active ? " -active" : ""}`}>
                        {slot.hide ? "*" : slot.char === "#" ? "•" : slot.char}
                      </div>
                    </span>
                  ))}
                </label>

                <div className="card-item__content">
                  <label htmlFor="cardName" className="card-item__info" ref={refMap.cardName}>
                    <div className="card-item__holder">Card Holder</div>
                    {cardName.trim().length ? (
                      <div className="card-item__name">
                        {[...cardName.replace(/\s\s+/g, " ")].map((ch, i) => (
                          <span className="card-item__nameItem" key={i}>
                            {ch}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="card-item__name">Full Name</div>
                    )}
                  </label>

                    <div className="card-item__date" ref={refMap.cardDate}>
                      <label htmlFor="cardMonth" className="card-item__dateTitle">
                        Expires
                      </label>
                      <label htmlFor="cardMonth" className="card-item__dateItem">
                        {cardMonth ? cardMonth : "MM"}
                      </label>
                      /
                      <label htmlFor="cardYear" className="card-item__dateItem">
                        {cardYear ? String(cardYear).slice(2, 4) : "YY"}
                      </label>
                    </div>
                </div>
              </div>
            </div>

            {/* Back */}
            <div className="card-item__side -back">
              <div className="card-item__cover">
                <img src={backgrounds[currentCardBackground - 1]} className="card-item__bg" />
              </div>
              <div className="card-item__band" />
              <div className="card-item__cvv">
                <div className="card-item__cvvTitle">CVV</div>
                <div className="card-item__cvvBand">
                  {Array.from(cardCvv).map((_, i) => (
                    <span key={i}>*</span>
                  ))}
                </div>
                <div className="card-item__type">
                  {cardType && (
                    <img
                      src={
                        cardType === "visa"
                          ? visa
                          : cardType === "amex"
                          ? amex
                          : cardType === "mastercard"
                          ? mastercard
                          : cardType === "discover"
                          ? discover
                          : troy
                      }
                      className="card-item__typeImg"
                      alt={cardType}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="card-form__inner" ref={formRef}>
          <div className="card-input">
            <label htmlFor="cardNumber" className="card-input__label">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              className="card-input__input"
              value={cardNumberFormatted}
              onChange={handleNumberChange}
              onFocus={focusInput}
              onBlur={blurInput}
              data-ref="cardNumber"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <div className="card-input">
            <label htmlFor="cardName" className="card-input__label">Card Holders</label>
            <input
              type="text"
              id="cardName"
              className="card-input__input"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onFocus={focusInput}
              onBlur={blurInput}
              data-ref="cardName"
              autoComplete="off"
            />
          </div>

          <div className="card-form__row">
            <div className="card-form__col">
              <div className="card-form__group">
                <label htmlFor="cardMonth" className="card-input__label">Expiration Date</label>
                <select
                  className="card-input__input -select"
                  id="cardMonth"
                  value={cardMonth}
                  onChange={(e) => setCardMonth(e.target.value)}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  data-ref="cardDate"
                >
                  <option value="" disabled>Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m < 10 ? `0${m}` : `${m}`} disabled={m < minCardMonth}>
                      {m < 10 ? `0${m}` : m}
                    </option>
                  ))}
                </select>

                <select
                  className="card-input__input -select"
                  id="cardYear"
                  value={cardYear}
                  onChange={(e) => setCardYear(e.target.value ? parseInt(e.target.value, 10) : "")}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  data-ref="cardDate"
                >
                  <option value="" disabled>Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="card-form__col -cvv">
              <div className="card-input">
                <label htmlFor="cardCvv" className="card-input__label">CVV</label>
                <input
                  type="password"
                  id="cardCvv"
                  className="card-input__input"
                  value={cardCvv}
                  onChange={handleCvvChange}
                  onFocus={() => { setFocusStyle(null); setIsFlipAnimating(true); setIsCardFlipped(true); }}
                  onBlur={() => { setIsFlipAnimating(true); setIsCardFlipped(false); }}
                  inputMode="numeric"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          <button
            className="card-form__button"
            onClick={(e) => { e.preventDefault(); clearFocus(); alert("Submit clicked"); }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
