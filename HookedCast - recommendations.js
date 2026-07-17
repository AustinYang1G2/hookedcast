/* ===========================================================
   RECOMMENDATION ENGINE (v1: hardcoded lookup)

   This is intentionally simple: a plain JS object, not a database.
   Your plan is to swap this for a real database later - when you do,
   getRecommendation() is the only function that needs to change.
   Everything else (the quiz, the results page) calls this function
   and doesn't care where the data comes from.
   =========================================================== */

// Keyed by species -> budget tier. "location" (shore/boat) only tweaks
// the notes text for now, not the gear itself - you can make it branch
// gear too once you have more setups written up.
const SETUPS = {
  bass: {
    low: {
      title: "Starter Bass Combo",
      rod: "6'6\" Medium Power, Fast Action spinning rod",
      reel: "2500-size spinning reel",
      line: "10 lb monofilament",
      lures: "Plastic worms, spinnerbaits, a basic crankbait",
      estCost: "$50–75",
      notes: "This is the classic do-it-all bass setup. Medium power handles most lures without being so stiff you lose light bites."
    },
    mid: {
      title: "All-Around Bass Combo",
      rod: "7' Medium-Heavy, Fast Action spinning rod",
      reel: "2500-3000-size spinning reel with a smooth drag",
      line: "12 lb fluorocarbon or braid with a fluoro leader",
      lures: "Texas-rigged worms, jigs, topwater frogs, crankbaits",
      estCost: "$100–140",
      notes: "The extra backbone lets you set the hook harder and horse fish out of cover, without giving up finesse presentations."
    },
    high: {
      title: "Two-Rod Bass Setup",
      rod: "7' Medium (finesse) + 7'3\" Heavy (flipping/frogging) - baitcaster",
      reel: "Baitcasting reel, 7:1 gear ratio",
      line: "15-20 lb fluorocarbon / 40-50 lb braid",
      lures: "Full range: jigs, swimbaits, topwater, deep crankbaits",
      estCost: "$180–260",
      notes: "Two dedicated rods means you're not re-tying every time you switch techniques - the real upgrade at this budget is speed, not just quality."
    }
  },
  walleye: {
    low: {
      title: "Starter Walleye Combo",
      rod: "6' Medium-Light, Fast Action spinning rod",
      reel: "2000-size spinning reel",
      line: "8 lb monofilament",
      lures: "Jig heads with plastics, live bait rigs",
      estCost: "$55–80",
      notes: "Medium-light lets you feel the subtle walleye bite, which is the single biggest skill in walleye fishing."
    },
    mid: {
      title: "All-Around Walleye Combo",
      rod: "6'6\" Medium-Light, Extra-Fast Action spinning rod",
      reel: "2500-size spinning reel with a smooth, sensitive drag",
      line: "8-10 lb braid with a fluorocarbon leader",
      lures: "Jigs, spinner rigs, crankbaits for trolling",
      estCost: "$100–145",
      notes: "Braid's zero stretch means you'll feel bites you'd otherwise miss, which directly translates to more fish."
    },
    high: {
      title: "Precision Walleye Setup",
      rod: "6'8\" Medium-Light, Extra-Fast graphite spinning rod",
      reel: "Premium 2500-size reel with a carbon drag system",
      line: "10 lb braid, 8 lb fluoro leader",
      lures: "Full jig lineup, spinner harnesses, crankbaits, live bait rigs",
      estCost: "$180–240",
      notes: "At this level the rod's sensitivity is the whole point - you're paying for feel, not durability."
    }
  },
  panfish: {
    low: {
      title: "Starter Panfish/Trout Combo",
      rod: "5'6\" Ultralight, Fast Action spinning rod",
      reel: "1000-size spinning reel",
      line: "4 lb monofilament",
      lures: "Small jigs, spinners, worms under a bobber",
      estCost: "$40–60",
      notes: "Ultralight gear turns even small fish into a fun fight, and it's the most forgiving setup to learn to cast on."
    },
    mid: {
      title: "All-Around Panfish/Trout Combo",
      rod: "6' Ultralight, Fast Action spinning rod",
      reel: "1000-2000-size reel with a light, smooth drag",
      line: "4-6 lb fluorocarbon",
      lures: "Small jigs, inline spinners, tiny crankbaits",
      estCost: "$75–110",
      notes: "A smoother drag matters more here than most people expect - light line snaps easily under a jerky drag."
    },
    high: {
      title: "Premium Panfish/Trout Setup",
      rod: "6'6\" Ultralight, Extra-Fast graphite rod",
      reel: "Premium 1000-size reel, very light weight",
      line: "4 lb fluorocarbon",
      lures: "Full micro-lure lineup: jigs, spinners, dries if fly-adjacent",
      estCost: "$150–200",
      notes: "This is a finesse setup built for feel and long days of casting - the weight savings add up over hundreds of casts."
    }
  },
  // Fallback for "not sure yet" - a genuinely versatile setup
  notsure: {
    low: {
      title: "Starter All-Purpose Combo",
      rod: "6'6\" Medium Power, Fast Action spinning rod",
      reel: "2500-size spinning reel",
      line: "10 lb monofilament",
      lures: "A basic mixed tackle box: jigs, worms, a crankbait, bobbers",
      estCost: "$55–80",
      notes: "This is the single most versatile beginner combo - it'll handle bass, walleye, and panfish reasonably well while you figure out what you enjoy most."
    },
    mid: {
      title: "All-Purpose Combo",
      rod: "6'6\" Medium Power, Fast Action spinning rod",
      reel: "2500-size spinning reel with a smooth drag",
      line: "10 lb fluorocarbon or braid with a leader",
      lures: "A broader mixed tackle box across several techniques",
      estCost: "$100–140",
      notes: "Same idea as the starter version, just with better components that'll last while you decide what to specialize in."
    },
    high: {
      title: "Premium All-Purpose Setup",
      rod: "6'6\" Medium Power, Fast Action spinning rod (premium graphite)",
      reel: "Premium 2500-size reel",
      line: "10-12 lb fluorocarbon or braid with a leader",
      lures: "A full mixed tackle box across techniques",
      estCost: "$160–220",
      notes: "You're paying for build quality and smoothness here, since the setup itself stays general-purpose."
    }
  }
};

const LOCATION_NOTES = {
  shore: "Since you're fishing from shore or a dock, this setup is sized so it's comfortable to cast repeatedly over a full session.",
  boat: "Since you're fishing from a boat or kayak, you've got more room to work a fish, so this setup can lean slightly toward power over finesse."
};

/**
 * The one function that matters. Give it quiz answers, get a setup back.
 * @param {{species: string, location: string, budget: string}} answers
 */
function getRecommendation(answers) {
  const speciesData = SETUPS[answers.species] || SETUPS.notsure;
  const setup = speciesData[answers.budget] || speciesData.mid;
  const locationNote = LOCATION_NOTES[answers.location] || "";

  return { ...setup, locationNote };
}
