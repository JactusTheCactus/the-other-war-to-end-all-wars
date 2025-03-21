# The Other War To End All Wars
## Core Mechanics
- Regions:
  - Start with attack and defense level `0`.
  - If a region's defense drops to `0`, it is immediately under attacker control.
  - Defense value carries over to the next turn.
  - Coastal regions have sea borders (neutral nations can pass through; enemies must go around or attack).
  - Sea regions behave like land regions.

- Combat:
  - If attack = defense, the defender wins, but the region is left defenseless.
  - Multiple units can enter a region; attack value is additive (e.g., Army `lvl5` + Navy `lvl3` + AF `lvl1` = atk `lvl9`).  
- Unit Types:
  - Army
  	- Range: Near
  - Navy
  	- Range: Coast
  	- Can ferry Army (extends Army range)
  - Air Force
  	- Range: Far
- Unit Production & Movement:
  - Unit production is a one-time purchase.
  - No build limits except for available funds.
  - There are no build times.
  - Units can stack and attack in one region.
  - Navies can be stationed at sea but can only attack coastal regions.
- Turn Structure:
  - All nations perform their actions simultaneously (Diplomacy-style).
  - No turn timer.
  - Defense is successful, but the region is defenseless if attack equals defense.
  - Regions with reduced defense are vulnerable in subsequent turns.
## Economy
- Income:
  - Regions have one income building, which increases income.
  - More regions = more buildings = more income = more units.
  - Income increases with more valuable resources (e.g., oil > wood, gems > oil).
- Resource Types:
  - Each region has one resource type with varying worth.
  - Example: Oil > Wood, Gems > Oil
- Upgrade Costs:
  - Attack/defense upgrades cost is multiplicative (`×1.2`).

|From||To||Cost|
|:-:|:-:|:-:|:-:|:-:|
|`Lvl-1`|→|`Lvl-2`|:|`$20.00k`|
|`Lvl-2`|→|`Lvl-3`|:|`$24.00k`|
|`Lvl-3`|→|`Lvl-4`|:|`$28.80k`|
|`Lvl-4`|→|`Lvl-5`|:|`$34.56k`|
|`Lvl-5`|→|`Lvl-6`|:|`$41.47k`|
|`Lvl-6`|→|`Lvl-7`|:|`$49.77k`|
|`Lvl-7`|→|`Lvl-8`|:|`$59.72k`|
|`Lvl-8`|→|`Lvl-9`|:|`$71.66k`|
|`Lvl-9`|→|`Lvl-10`|:|`$86.00k`|
## AI Decision-Making
- Reward Calculation:
  - Reward
	- Worth of region's resource
  - Risk
	- Enemy's defense level
  - Score
	- Reward / Risk
		- High Score = Good decision (target with high reward, low risk)
		- Low Score = Bad decision (avoid risky targets)
- AI Behavior:
  - The AI targets regions based on the highest reward while considering the risk involved.
  - The AI prioritizes attacking neighboring regions with the highest reward and lowest risk.
## Victory Condition
- Victory is achieved by complete map domination (`100%` control of all regions).
- If a nation's capital is lost, the closest region to the center-of-mass of the country becomes the new capital.
