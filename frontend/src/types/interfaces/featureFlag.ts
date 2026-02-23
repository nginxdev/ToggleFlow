export interface Variation {
  id: string;
  name: string;
  value: string;
  type?: string;
}

export interface TargetingRule {
  id: string;
  attribute: string;
  operator: string;
  value: string;
  variationId: string;
}

export interface FlagRules {
  targeting?: {
    individual?: Array<{ userId: string; variationId: string }>;
    segments?: Array<{ segmentId: string; variationId: string }>;
    rules?: TargetingRule[];
    defaultVariationId?: string;
    offVariationId?: string;
  };
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description?: string;
  isEnabled: boolean;
  type?: string;
  isArchived: boolean;
  defaultValue: string;
  variations?: Variation[];
  flagStates?: Array<{
    id: string;
    isEnabled: boolean;
    rules?: FlagRules;
    environmentId: string;
    environment: {
      id: string;
      name: string;
      key: string;
    };
  }>;
  project?: {
    id: string;
    name: string;
    environments?: Array<{
      id: string;
      name: string;
      key: string;
    }>;
  };
}
