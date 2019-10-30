import { InjectedWeaver } from "./InjectedWeaver";
import { BriefWeaver } from './BriefWeaver';
import { DefaultPropertiesWeaver } from './DefaultPropertiesWeaver';
export const domainWeavers = [
    new InjectedWeaver(),
    new BriefWeaver(),
    new DefaultPropertiesWeaver()
]