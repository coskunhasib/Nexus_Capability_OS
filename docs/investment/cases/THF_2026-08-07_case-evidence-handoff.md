# THF Case / Evidence Handoff — 2026-08-07

**Purpose:** Preserve the full THF case context outside the chat so the conversation can be deleted without losing the material needed for future Nexus Investment Pipeline work.

**Status:** EVIDENCE / HANDOFF ONLY — NO IMPLEMENTATION AUTHORIZED  
**Canonical investment branch:** `feature/nexus-investment-pipeline`  
**Related plan:** `docs/investment/NEXUS_Investment_Pipeline_THF_Remediation_Plan_2026-08-07.md`  
**Reference asset:** THF — Tera Portföy Hisse Senedi TL Fonu (Hisse Senedi Yoğun Fon)  
**As-of:** 2026-08-07

---

## 1. Why this case matters

THF exposed three distinct failures in the investment pipeline / analysis workflow:

1. **Discovery failure:** THF was not surfaced proactively before the user named it.
2. **Research / retrieval failure:** when the user asked to examine THF, a highly relevant fresh Reddit post was not found in the first research pass.
3. **Decision failure:** after enough data had been assembled, the analysis stopped at interpretation / monitoring instead of producing risk-profile-specific action guidance.

This case is therefore the canonical evidence handoff behind the remediation plan. It must not be reduced to a THF-specific hard-coded rule; the eventual remediation is intended to be asset-agnostic.

---

## 2. User-provided Reddit evidence

Two screenshots were provided by the user from `r/Yatirim`. They are stored next to this document under:

- `docs/investment/cases/evidence/thf-reddit-2026-08-07-01.jpeg`
- `docs/investment/cases/evidence/thf-reddit-2026-08-07-02.jpeg`

### 2.1 Core thesis captured in the screenshots

The post states, in substance:

- the author has a **sense that THF is being prepared for something**;
- the portfolio was **materially rebuilt at the end of July**;
- a **very large amount of fresh money** entered the fund;
- on the 6 August data, roughly **TRY 187m net inflow** was observed;
- fund size rose to roughly **TRY 1.261bn**;
- active share count rose to roughly **575.7m**;
- investor count rose from **6,453 to 6,957**, i.e. **+504 investors in one day**;
- this was interpreted as an unusually large one-day fund flow, not routine daily noise;
- positions highlighted as added / built included:
  - OZATD ~7.21%
  - KARCL ~4.67%
  - MANAS ~4.34%
  - ORZAX ~3.63%
  - ANELE ~2.81%
- LIDER and AKBNK were stated as fully removed;
- BARMA, NETCD and TEHOL were materially reduced;
- TERA was increased to about 6.69%;
- the post characterized OZATD / TERA / TEHOL / KARCL / MANAS as narrower, more volatile and more aggressive than broad/liquid large-cap names;
- the post’s proposed sequence was essentially:
  - clean the old basket;
  - place more aggressive positions;
  - preserve cash / collateral buffer;
  - wait for new money inflow;
- the author hypothesized that THF could become a more accessible alternative for investors who cannot access TLY/TMV-type qualified-investor funds under the newer rules;
- the author explicitly labelled that part as personal interpretation, not a confirmed strategy;
- the author also stated that they were **not personally buying THF at that stage**.

### 2.2 Why the first research pass missed it

The Reddit post title did not depend on a clean exact-match `THF` title pattern. The useful THF thesis lived in the body and in related-entity context. A code-only search such as `THF`, `THF fon`, or `THF Tera` is therefore structurally fragile.

The retrieval lesson from this case is:

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
fund flow / investor anomaly terms
↓
Reddit / X / forum semantic search
```

The future retrieval layer should use entity expansion plus title/body/semantic matching, not exact-code matching alone.

---

## 3. Verified / corroborated event chain assembled during the analysis

The following chain was assembled after the Reddit evidence was supplied and official / market sources were cross-checked in the analysis session.

### 3.1 23 July 2026 — manager migration signal

The key additional finding was that **İbrahim Bekçi** and **Ethem Umut Beytorun**, managers associated with TLY, were shown as appointed to THF on **23 July 2026**.

Interpretation:

- this is a stronger signal than a simple portfolio rebalance;
- it suggests transfer of management / strategy DNA from the TLY side into THF;
- this should have been independently detectable by a `MANAGER_MIGRATION` detector before the large August fund flows.

Evidence level for the appointment event in the analysis: **verified from KAP metadata at the time of review**.

### 3.2 End of July 2026 — portfolio regime shift

Observed / reported changes included:

- OZATD ~7.21%
- ASELS ~7.16%
- TERA ~6.69%
- TEHOL ~5.58%
- KARCL ~4.67%
- MANAS ~4.34%
- TRHOL ~4.10%
- YKBNK ~3.81%
- THYAO ~3.65%
- BRSAN ~3.64%
- ORZAX ~3.63%

New / enlarged aggressive positions highlighted in the working analysis included OZATD, KARCL, MANAS, ORZAX, ANELE, SVGYO and TABGD. LIDER and AKBNK were described as removed; several other positions were reduced.

Interpretation:

- this was not treated as a small rebalance;
- it was classified as a probable **portfolio regime change** / aggressive active-management shift.

### 3.3 Tera ecosystem concentration

The working analysis highlighted combined exposure to Tera-linked names as an additional factor-risk dimension. The cited snapshot was approximately:

- TERA ~6.69%
- TEHOL ~5.58%
- TRHOL ~4.10%

Combined: **~16.37%**.

This was treated as a correlated stress-risk factor rather than three fully independent positions.

### 3.4 6 August 2026 — abnormal capital flow

The Reddit evidence reported approximately:

- **TRY 187m** one-day net inflow;
- fund size ~**TRY 1.261bn**;
- active shares ~**575.7m**;
- investors **6,453 → 6,957** (+504).

The key observation was that the flow represented roughly **17–18% of the prior fund size**, which is not routine noise for a single day.

### 3.5 7 August 2026 — second large inflow wave

A subsequent data point used in the analysis showed approximately:

- fund size ~**TRY 1.682bn**;
- active shares ~**758.16m**;
- investors ~**7,728**;
- additional estimated net cash inflow ~**TRY 404.8m**.

Combined 6–7 August estimated inflow was therefore roughly **TRY 592m**.

Important temporal rule:

- this 7 August evidence can be used to **validate** the 6 August signal after the fact;
- it must **not** be leaked backward into a 6 August historical replay or decision.

### 3.6 Large-ticket / large-investor candidate signal

The working calculation noted that fund size grew much faster than investor count.

Approximate figures used:

- 6 Aug average balance: ~TRY 181k per investor;
- 7 Aug average balance: ~TRY 218k per investor;
- marginal flow / net added investor: ~TRY 525k.

Caveat:

`TRY 404.8m / 771` does **not** prove that every new investor invested ~TRY 525k, because existing investors may also have added money. The valid inference is only that **capital growth materially outpaced investor-count growth**, which is consistent with a large-ticket / larger-investor-flow candidate signal.

---

## 4. Original THF analysis snapshot preserved from the session

The first-pass THF analysis classified the fund as an aggressive active equity fund with unusually strong recent alpha, but with growing capacity / liquidity concerns as AUM expands.

### 4.1 Performance snapshot discussed

The working snapshot cited roughly:

| Period | THF | Comparison measure | Approx. excess |
|---|---:|---:|---:|
| 1 month | +1.76% | -4.33% | +6.09 pp |
| 3 months | +2.34% | -7.32% | +9.66 pp |
| 6 months | +24.46% | +3.21% | +21.25 pp |
| 2026 YTD | +36.40% | +23.94% | +12.46 pp |
| 1 year | +75.08% | +28.78% | +46.30 pp |

The analysis explicitly noted that the fund’s history was still short, so the observed alpha had not yet been proven across many market regimes.

### 4.2 Capacity / liquidity concern

The central forward risk identified was **strategy capacity**:

- a small active fund can move in and out of narrower names more easily;
- as AUM rises from ~1bn to 2bn, 3bn, 5bn TL, the same target weight requires much larger absolute position sizes;
- therefore days-to-deploy and days-to-liquidate become increasingly important;
- aggressive positions in narrower names can become self-impacting as fund size grows.

This is why the remediation plan requires capacity / liquidity metrics to be integrated into discovery and action scoring.

### 4.3 VİOP cash-collateral nuance / correction

An earlier interpretation treated a high VİOP cash-collateral percentage as potentially undeployed cash / dry powder. That was later corrected.

Correct rule preserved from the session:

- VİOP cash collateral can correspond to derivatives exposure;
- therefore `VİOP cash collateral %` is **not automatically idle cash**;
- economic equity exposure must be assessed together with the direction and notional of derivatives positions.

This correction is important because the pipeline should not infer cash deployment capacity from the collateral percentage alone.

---

## 5. Why THF should have been discovered by the pipeline

The case contains a sequence of independent but related events:

```text
23 Jul: manager migration
        ↓
End Jul: portfolio regime shift
        ↓
6 Aug: abnormal fund flow + investor-count jump
        ↓
Social thesis appears
        ↓
7 Aug: second large inflow validates persistence
```

The expected pipeline behavior is therefore not just “watch THF because TLY is watched.”

It should be:

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

The architectural gap was not merely “missing one source.” It was failure to **fuse events across entities and time**.

---

## 6. Decision-layer failure and risk-profile requirement

After assembling the evidence, the analysis initially ended with language equivalent to “interesting / should be monitored.” That was insufficient for the intended investment pipeline.

The user explicitly required that recommendations be separated by user risk tolerance / risk budget.

The preserved manual action framing from the session was:

| Risk profile | New investor | Existing holder | Manual conclusion at the time |
|---|---|---|---|
| Conservative | Do not enter | Do not increase | **BEKLE / ALMA** |
| Balanced | Wait for 3–5 day confirmation | Hold, no aggressive add | **BEKLE → teyitle AL** |
| Aggressive | Start with a partial target position | Hold + limited add | **KADEMELİ AL** |
| Speculative | First tranche can be considered | Hold + add by tranche | **AL / KADEMELİ AL** |

This table is a **historical record of the manual analysis**, not a production rule and not an implementation approval.

Required future behavior:

- `Discovery Score` and `Action Score` must be separate;
- high discovery conviction does not automatically imply `AL`;
- if the user risk profile is unknown, the system must output multiple risk-profile rows rather than silently assuming one;
- action vocabulary should include:
  - `AL`
  - `KADEMELİ AL`
  - `TUT`
  - `BEKLE`
  - `AZALT`
  - `SAT`
  - `VERİ YETERSİZ / ACTION BLOCKED`
- action output should include sizing, invalidation and re-entry conditions.

---

## 7. Research / reasoning errors preserved for regression purposes

### E-01 — Exact-keyword retrieval bias
The initial THF research focused mainly on official / market-data routes and did not perform sufficiently broad social entity expansion.

### E-02 — Social-source role ambiguity
Old TLY rules said social media was only for validation, while the newer pipeline specification treated social media as an early-signal / hypothesis layer. This conflict can suppress genuine discovery.

### E-03 — Event isolation
Manager migration, portfolio change, capital flow, investor count and regulation context were initially analyzed as separate facts rather than fused into a single candidate thesis.

### E-04 — Recommendation completeness failure
The analysis did not automatically end with a user-risk-specific action matrix.

### E-05 — Derivatives collateral inference risk
VİOP collateral was initially too easily interpreted as undeployed cash; the rule was corrected to require economic-exposure analysis.

### E-06 — Look-ahead risk
The second-day inflow is powerful validation, but a historical 6 August replay must not use 7 August data.

These errors are intentionally preserved here because they should become regression tests, not disappear as conversational context.

---

## 8. THF golden-case expectations

The related remediation plan defines the formal test suite. This handoff preserves the evidence behind it.

Minimum expected future behavior:

1. detect the 23 July manager migration;
2. detect end-July portfolio regime change;
3. find the Reddit thesis even if `THF` is not cleanly represented in the title;
4. detect abnormal 6 August inflow after removing price effect;
5. combine investor-count / average-balance information without overclaiming individual investor ticket sizes;
6. fuse manager + portfolio + flow + social evidence;
7. preserve `observed / inferred / hypothesized / verified` evidence states;
8. prevent 7 August data from leaking into the 6 August replay;
9. produce risk-profile-specific action output;
10. include capacity / liquidity countercase and false-positive controls.

---

## 9. Conversation-state handoff

The following state from the chat is intentionally captured here so it does not depend on conversation history:

- The THF remediation plan has been written and merged **only into `feature/nexus-investment-pipeline`**, not `main`.
- `main` remains forbidden as a merge target for investment-pipeline work.
- The remediation plan is **not yet approved for implementation**.
- Documentation / evidence preservation is allowed; implementation remains blocked.
- The next implementation step, if and only if explicit written approval is later provided, starts with a read-only repo/branch/PR audit and then follows the gated phases in the remediation plan.
- THF must remain a **golden regression case**, not a one-off hard-coded exception.

### Explicit approval state

**Implementation approval:** `NOT GRANTED`

Examples that do **not** count as implementation approval:
- “olur”
- “tamam”
- “mantıklı”
- general positive feedback
- requests to preserve / document information

Implementation begins only after an unambiguous written instruction equivalent to:

> “Planı onaylıyorum, uygulamaya geç.”

---

## 10. Deletion-safety conclusion

With this document plus the two source screenshots committed to the canonical investment branch, the critical THF case information that previously existed only in the conversation is preserved in the repository:

- user-provided social evidence;
- raw thesis and chronology;
- verified / inferred distinctions;
- the first-pass THF analysis and later corrections;
- discovery / retrieval / decision failures;
- risk-profile action requirement;
- approval / branch governance state;
- regression expectations.

This file is the intended handoff point if the chat is later deleted.
