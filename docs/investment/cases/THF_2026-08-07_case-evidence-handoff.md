# THF Case / Evidence Handoff — 2026-08-07

**Purpose:** Preserve the THF case context outside the chat so future Nexus Investment Pipeline work does not depend on this conversation remaining available.  
**Status:** **EVIDENCE / HANDOFF ONLY — NO IMPLEMENTATION AUTHORIZED**  
**Canonical investment branch:** `feature/nexus-investment-pipeline`  
**Related remediation plan:** `docs/investment/NEXUS_Investment_Pipeline_THF_Remediation_Plan_2026-08-07.md`  
**Reference asset:** THF — Tera Portföy Hisse Senedi TL Fonu (Hisse Senedi Yoğun Fon)  
**As-of:** 2026-08-07

---

## 1. Why this case matters

THF exposed three distinct failures in the investment workflow:

1. **Discovery failure:** the pipeline did not surface THF proactively before the user named it.
2. **Research / retrieval failure:** when the user asked to examine THF, a highly relevant fresh Reddit thesis was not found in the first research pass.
3. **Decision failure:** after enough data was assembled, the analysis stopped at interpretation / monitoring instead of producing risk-profile-specific action guidance.

THF is therefore the canonical **golden regression case** for the remediation plan. The eventual fixes must be asset-agnostic; THF must not become a one-off hard-coded exception.

---

## 2. User-provided Reddit evidence

Two Reddit screenshots from `r/Yatirim` were supplied by the user in the conversation.

### 2.1 Repository preservation format

The repository now preserves the screenshot evidence in two forms:

1. **Compressed visual evidence copies**
   - `docs/investment/cases/evidence/thf-reddit-2026-08-07-01.jpeg`
   - `docs/investment/cases/evidence/thf-reddit-2026-08-07-02.jpeg`
2. **Verbatim visible-text transcript + original-file metadata / SHA-256 hashes**
   - `docs/investment/cases/evidence/THF_reddit_screenshot_transcript_2026-08-07.md`

The committed JPEGs are deliberately smaller visual derivatives for repository evidence review; they are **not byte-identical originals**. The transcript records the original local filenames, original dimensions and SHA-256 hashes, and preserves every clearly visible sentence from the screenshots. This distinction is intentional so the handoff does not overstate evidence fidelity.

### 2.2 Core thesis visible in the screenshots

The Reddit post stated, in substance:

- the author sensed that **THF was being prepared for a new setup**;
- the portfolio had been **materially rebuilt at the end of July**;
- a **very large amount of fresh money** had entered the fund;
- 6 August data appeared to show approximately **TRY 187m net inflow**;
- fund size rose to approximately **TRY 1.261bn**;
- active share count rose to approximately **575.7m**;
- investor count rose from **6,453 to 6,957**, or **+504 in one day**;
- the post interpreted this as roughly **17–18% of prior fund size** in one-day inflow, not routine daily flow;
- highlighted new / built positions included approximately:
  - OZATD 7.21%
  - KARCL 4.67%
  - MANAS 4.34%
  - ORZAX 3.63%
  - ANELE 2.81%
- LIDER and AKBNK were stated as fully removed;
- BARMA, NETCD and TEHOL were materially reduced;
- TERA was increased to approximately 6.69%;
- OZATD / TERA / TEHOL / KARCL / MANAS were characterized as narrower, more volatile and more aggressive than broad/liquid large-cap names;
- the hypothesized preparation sequence was essentially:
  - clean the old basket;
  - install more aggressive positions;
  - preserve cash / collateral buffer;
  - wait for new money inflow;
- the author hypothesized that THF could become a more accessible alternative for investors unable to access TLY/TMV-type qualified-investor funds after newer rules;
- that regulatory / strategic interpretation was explicitly labelled by the author as **personal interpretation, not a confirmed strategy**;
- the author also stated that they were **not personally buying THF at that stage**.

### 2.3 Evidence handling rule

The Reddit material is **social-source evidence**, not proof of Tera Portföy's intent.

Its valid roles are:

- discovery / early warning;
- thesis generation;
- semantic/entity expansion;
- later cross-checking against KAP / TEFAS / SPK / market / portfolio data.

It must never become standalone confirmation simply because the thesis later looks plausible.

---

## 3. Why the first research pass missed the Reddit post

The first THF research pass was biased toward official / market-data routes and exact-code-style searching.

The post demonstrated why this is fragile: useful information about a fund can live in the body of a post whose title does not cleanly expose the fund code.

The required retrieval graph is therefore:

```text
THF
  ↓
Tera Portföy
  ↓
portfolio managers
  ↓
TLY / TMV / T3B / related Tera funds
  ↓
new / top holdings
  ↓
fund-flow / investor-anomaly terms
  ↓
Reddit / X / forum semantic search
```

Future retrieval must combine:

- exact-code match;
- full fund name;
- asset-manager match;
- portfolio-manager names;
- related-fund entities;
- holding entities;
- title match;
- body match;
- semantic match.

---

## 4. Event chain assembled during the analysis

### 4.1 23 July 2026 — manager migration signal

A key additional finding in the later analysis was that **İbrahim Bekçi** and **Ethem Umut Beytorun**, associated with TLY management, were shown as appointed to THF on **23 July 2026**.

Working evidence state at the time: **verified from KAP metadata during review**.

Why it matters:

- it is stronger than a routine rebalance;
- it creates a plausible transfer of management / strategy DNA;
- a future `MANAGER_MIGRATION` detector should surface this before waiting for the later flow anomaly.

### 4.2 End of July 2026 — portfolio regime shift

The working snapshot discussed approximately:

| Holding | Approx. THF weight |
|---|---:|
| OZATD | 7.21% |
| ASELS | 7.16% |
| TERA | 6.69% |
| TEHOL | 5.58% |
| KARCL | 4.67% |
| MANAS | 4.34% |
| TRHOL | 4.10% |
| YKBNK | 3.81% |
| THYAO | 3.65% |
| BRSAN | 3.64% |
| ORZAX | 3.63% |

New / enlarged aggressive positions highlighted in the session included OZATD, KARCL, MANAS, ORZAX, ANELE, SVGYO and TABGD. LIDER and AKBNK were described as removed, while several other positions were reduced.

Working interpretation: **probable portfolio regime change / more aggressive active-management setup**, not merely a small rebalance.

### 4.3 Tera-ecosystem concentration

The analysis highlighted a common-factor exposure snapshot of approximately:

- TERA 6.69%
- TEHOL 5.58%
- TRHOL 4.10%

Combined: **~16.37%**.

This was treated as correlated ecosystem/factor risk rather than three fully independent holdings under stress.

### 4.4 6 August 2026 — abnormal capital flow

The Reddit evidence reported approximately:

- **TRY 187m** one-day net inflow;
- fund size **~TRY 1.261bn**;
- active shares **~575.7m**;
- investors **6,453 → 6,957** (+504).

Key interpretation: the inflow was roughly **17–18% of prior fund size**, large enough to be considered an abnormal-flow event candidate.

### 4.5 7 August 2026 — second large inflow wave

The subsequent working snapshot used in the session showed approximately:

- fund size **~TRY 1.682bn**;
- active shares **~758.16m**;
- investors **~7,728**;
- estimated additional net cash inflow **~TRY 404.8m**.

Combined 6–7 August estimated inflow: **~TRY 592m**.

### 4.6 Strict temporal rule

The 7 August evidence is useful as **post-event validation** of the 6 August signal.

It must **not** be allowed to leak backward into a historical 6 August decision replay.

This becomes a mandatory no-look-ahead regression test.

### 4.7 Large-ticket / larger-investor candidate signal

The working calculations noted:

- 6 Aug average balance: **~TRY 181k / investor**;
- 7 Aug average balance: **~TRY 218k / investor**;
- marginal flow divided by net added investors: **~TRY 525k**.

Critical caveat:

`TRY 404.8m / 771` **does not prove** that each new investor invested TRY 525k. Existing investors can also add capital. The defensible inference is narrower:

> **capital growth materially outpaced investor-count growth**, consistent with a large-ticket / larger-investor-flow candidate signal.

---

## 5. First-pass THF analysis preserved from the session

### 5.1 Performance snapshot discussed

The working snapshot cited approximately:

| Period | THF | Comparison measure | Approx. excess |
|---|---:|---:|---:|
| 1 month | +1.76% | -4.33% | +6.09 pp |
| 3 months | +2.34% | -7.32% | +9.66 pp |
| 6 months | +24.46% | +3.21% | +21.25 pp |
| 2026 YTD | +36.40% | +23.94% | +12.46 pp |
| 1 year | +75.08% | +28.78% | +46.30 pp |

The analysis also explicitly noted that THF's track record was still short, so the observed alpha had not yet been demonstrated across many market regimes.

### 5.2 Capacity / liquidity risk

The main forward-looking risk identified was **strategy capacity**:

- small active funds can move in and out of narrower stocks more easily;
- as AUM grows, the same portfolio weight requires much larger absolute position sizes;
- days-to-deploy and days-to-liquidate therefore become increasingly important;
- narrow/aggressive holdings can become self-impacting as fund size expands.

This is why the remediation plan requires liquidity/capacity to affect both discovery and action scores.

### 5.3 VİOP collateral correction

An earlier interpretation in the conversation treated a high VİOP cash-collateral percentage as potentially undeployed cash / dry powder.

That interpretation was corrected.

Canonical rule to preserve:

- VİOP cash collateral can correspond to derivatives exposure;
- `VİOP cash collateral %` is **not automatically idle cash**;
- economic equity exposure must be assessed together with derivatives direction and notional.

This correction must survive chat deletion and should become a regression guard.

---

## 6. Why the pipeline should have discovered THF

The important point is the **sequence and fusion** of independent events:

```text
23 Jul: manager migration
        ↓
End Jul: portfolio regime shift
        ↓
6 Aug: abnormal capital flow + investor-count jump
        ↓
Social thesis appears
        ↓
7 Aug: second large inflow validates persistence
```

Expected pipeline behavior:

```text
manager change
+ portfolio change
+ capital-flow anomaly
+ investor-structure anomaly
+ social hypothesis
+ regulation / accessibility context
→ event fusion
→ high-priority investment candidate
```

The architectural failure was therefore **not merely one missing source**. It was failure to fuse events across entities and time.

---

## 7. Decision-layer failure and risk-profile requirement

The original analysis initially ended at “interesting / should be monitored.” That is insufficient for the intended investment pipeline.

The user explicitly required action guidance to vary by user risk tolerance / risk budget.

The manual framing produced during the conversation was:

| Risk profile | New investor | Existing holder | Historical manual conclusion |
|---|---|---|---|
| Conservative | Do not enter | Do not increase | **BEKLE / ALMA** |
| Balanced | Wait for 3–5 day confirmation | Hold, no aggressive add | **BEKLE → teyitle AL** |
| Aggressive | Start with a partial target position | Hold + limited add | **KADEMELİ AL** |
| Speculative | First tranche can be considered | Hold + add by tranche | **AL / KADEMELİ AL** |

This table is preserved only as a **historical record of the manual 7 August analysis**. It is not a production rule and it is not implementation approval.

Required future contract:

- separate `Discovery Score` from `Action Score`;
- high discovery conviction must not automatically mean `AL`;
- if the user's profile is unknown, output multiple risk-profile rows rather than silently assuming one;
- action vocabulary:
  - `AL`
  - `KADEMELİ AL`
  - `TUT`
  - `BEKLE`
  - `AZALT`
  - `SAT`
  - `VERİ YETERSİZ / ACTION BLOCKED`
- every actionable output should carry sizing, invalidation, upgrade/downgrade and re-entry conditions.

---

## 8. Research / reasoning errors preserved for regression

### E-01 — Exact-keyword retrieval bias
Initial research did not use sufficiently broad social/entity expansion.

### E-02 — Social-source role ambiguity
Older TLY rules treated social media as validation-only while the newer pipeline specification treats it as discovery / early-warning / hypothesis input. The remediation must resolve this conflict canonically while still preventing social media from becoming standalone proof.

### E-03 — Event isolation
Manager migration, portfolio change, capital flow, investor count and regulatory context were initially treated too independently.

### E-04 — Recommendation completeness failure
The analysis did not automatically produce user-risk-specific action guidance.

### E-05 — Derivatives-collateral inference risk
VİOP collateral was initially too easily treated as undeployed cash.

### E-06 — Look-ahead risk
The 7 August second-wave inflow can validate but cannot contaminate the 6 August replay.

These mistakes are intentionally documented so they can become regression tests instead of disappearing with the conversation.

---

## 9. Golden-case expectations

A future compliant pipeline should, at minimum:

1. detect the 23 July manager migration;
2. detect the end-July portfolio regime shift;
3. find the Reddit thesis even when `THF` is not cleanly exposed in the title;
4. detect the abnormal 6 August inflow after removing price effect;
5. combine investor-count and average-balance evidence without overclaiming individual ticket sizes;
6. fuse manager + portfolio + flow + social evidence;
7. preserve `observed / inferred / hypothesized / verified` evidence states;
8. prevent 7 August data from leaking into the 6 August replay;
9. produce risk-profile-specific action output;
10. include capacity/liquidity countercase and false-positive controls.

---

## 10. Conversation-state handoff

The following state must remain valid independently of this chat:

- the remediation plan is documented on the investment line;
- `feature/nexus-investment-pipeline` is the canonical investment integration branch;
- `main` is **not** a merge target for investment-pipeline work;
- the remediation plan is **not yet approved for implementation**;
- documentation/evidence preservation is allowed;
- runtime/code/pipeline implementation remains blocked;
- if explicit written approval is later granted, the first implementation step is the read-only repo/branch/PR audit defined in the remediation plan;
- THF remains a golden regression case, not a hard-coded exception.

### Explicit approval state

**Implementation approval:** `NOT GRANTED`

The following do **not** count as implementation approval:

- “olur”
- “tamam”
- “mantıklı”
- emoji / reaction
- general positive feedback
- requests to preserve or document information

Implementation begins only after an unambiguous written instruction equivalent to:

> **“Planı onaylıyorum, uygulamaya geç.”**

---

## 11. Deletion-safety conclusion

The critical **substantive** THF information that previously depended on this conversation is preserved through:

- this case/evidence handoff;
- the remediation plan;
- compressed visual copies of the two user-provided screenshots;
- a verbatim transcript of all clearly visible screenshot text;
- original screenshot filenames, dimensions and SHA-256 hashes;
- chronology and evidence-state distinctions;
- the initial THF analysis and later corrections;
- discovery / retrieval / decision failure analysis;
- risk-profile action requirement;
- branch / approval governance state;
- regression expectations.

The visual JPEGs in the repository are compressed derivatives rather than byte-identical originals; that fact is deliberately documented. The analytical and textual evidence needed to continue the Nexus work no longer depends on retaining this chat.
