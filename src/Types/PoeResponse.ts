export type PoeFirstResponse = {
	id: string;
	complexity: number;
	result: string[];
	total: number;
};

export type LeagueResponse = {
	result: {
		id: string;
		realm: string;
		text: string;
	}[];
};

export type TradeDataItemsResult = {
	id: string;
	label: string;
	entries: Array<{
		name?: string;
		type: string;
		text: string;
		flags?: {
			unique?: boolean;
		};
	}>;
};

export type TradeDataItems = {
	result: TradeDataItemsResult[];
};

export type PoeSecondResult = {
	id: string;
	listing: {
		method: "psapi";
		indexed: Date;
		stash: {
			name: string;
			x: number;
			y: number;
		};
		whisper: string;
		whisper_token: string;
		account: {
			name: string;
			lastCharacterName: string;
			online: {
				league: string;
			};
			language: string;
			realm: string;
		};
		price: {
			type: string;
			amount: number;
			currency: string;
		};
	};
	item: ItemType;
};

export type PoeSecondResponse = {
	result: PoeSecondResult[];
};

export type ItemType = {
	verified: boolean;
	w: number;
	h: number;
	icon: string;
	support?: boolean;
	stackSize?: number;
	maxStackSize?: number;
	stackSizeText?: string;
	league?: string;
	id?: string; // a unique 64 digit hexadecimal string
	influences?: {
		elder?: boolean;
		shaper?: boolean;
		searing?: boolean;
		tangled?: boolean;
		abyssJewel?: boolean;
		delve?: boolean;
		fractured?: boolean;
		synthesised?: boolean;
	};
	sockets?: ItemSocket[];
	socketedItems?: ItemType[];
	name: string;
	typeLine: string;
	baseType: string;
	rarity?: "Normal" | "Magic" | "Rare" | "Unique";
	identified: boolean;
	itemLevel?: number;
	ilvl: number;
	note?: string;
	forum_note?: string;
	lockedToCharacter?: boolean;
	lockedToAccount?: boolean;
	duplicated?: boolean;
	split?: boolean;
	corrupted?: boolean;
	unmodifiable?: boolean;
	cisRaceReward?: boolean;
	seaRaceReward?: boolean;
	thRaceReward?: boolean;
	properties?: ItemProperty[];
	notableProperties?: ItemProperty[];
	requirements?: ItemProperty[];
	additionalProperties?: ItemProperty[];
	nextLevelRequirements?: ItemProperty[];
	talismanTier?: number;
	rewards?: {
		label: string;
		rewards: { [key: string]: number };
	}[];
	secDescrText?: string;
	utilityMods?: string[];
	logbookMods?: {
		name: string;
		faction: {
			id: string; // Faction1, Faction2, Faction3, or Faction4
			name: string;
		};
		mods: string[];
	}[];
	enchantMods?: string[];
	scourgeMods?: string[];
	implicitMods?: string[];
	ultimatumMods?: {
		type: string;
		tier: number;
	}[];
	explicitMods?: string[];
	craftedMods?: string[];
	fracturedMods?: string[];
	crucibleMods?: string[];
	cosmeticMods?: string[];
	veiledMods?: string[];
	veiled?: boolean;
	descrText?: string;
	flavourText?: string[];
	flavourTextParsed?: (string | object)[];
	flavourTextNote?: string;
	prophecyText?: string;
	isRelic?: boolean;
	foilVariation?: number;
	replica?: boolean;
	foreseeing?: boolean;
	incubatedItem?: {
		name: string;
		level: number;
		progress: number;
		total: number;
	};
	scourged?: {
		tier: number;
		level?: number;
		progress?: number;
		total?: number;
	};
	crucible?: {
		layout: string; // URL to an image of the tree layout
		nodes: { [key: string]: CrucibleNode };
	};
	ruthless?: boolean;
	frameType?: number;
	artFilename?: string;
	hybrid?: {
		isVaalGem?: boolean;
		baseTypeName: string;
		properties?: ItemProperty[];
		explicitMods?: string[];
		secDescrText?: string;
	};
	extended?: {
		category?: string;
		subcategories?: string[];
		prefixes?: number;
		suffixes?: number;
	};
	x?: number;
	y?: number;
	inventoryId?: string;
	socket?: number;
	colour?: "S" | "D" | "I" | "G";
};

export interface CrucibleNode {
	skill?: number; // mod hash
	tier?: number; // mod tier
	icon?: string;
	allocated?: boolean; // always true if present
	isNotable?: boolean; // always true if present
	isReward?: boolean; // always true if present
	stats?: string[]; // stat descriptions
	reminderText?: string[];
	orbit: number; // the column this node occupies
	orbitIndex: number; // the node's position within the column
	out: string[]; // node identifiers of nodes this one connects to
	in: string[]; // node identifiers of nodes connected to this one
}

export type ItemProperty = {
	name: string;
	values: [string, number][];
	displayMode?: number;
	progress?: number;
	type?: number;
	suffix?: string;
};

export type ItemRequirement = {
	name: string;
	values: [string, number][];
	displayMode: number;
	type?: number;
};

export type ItemSocket = {
	group: number;
	attr?: "S" | "D" | "I" | "G" | "A" | "DV";
	sColour?: "R" | "G" | "B" | "W" | "A" | "DV";
};

export type Influences = {
	shaper?: boolean;
	elder?: boolean;
	crusader?: boolean;
	redeemer?: boolean;
	hunter?: boolean;
	warlord?: boolean;
};

export type IncubatedItem = {
	name: string;
	level: number;
	progress: number;
	total: number;
};
