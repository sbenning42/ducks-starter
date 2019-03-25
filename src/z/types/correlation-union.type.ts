import { StaticCorrelation } from "../classes/static-correlation.class";
import { Correlation } from "../classes/correlation.class";

export type CorrelationUnion<Data = any> = string | StaticCorrelation<Data> | Correlation<Data>;
