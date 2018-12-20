import Aggregate from "../Model/Aggregate/Aggregate";
import FieldValue from "../Model/Aggregate/FieldValue";
import AggregateManager from "../Model/ODM/AggregateManager";
import IAggregateNormalizer from "../Model/ODM/IAggregateNormalizer";

class JSONDenormalizer implements IAggregateNormalizer {
    private manager: AggregateManager;

    public normalize(aggregate: Aggregate): object {
        const fieldValuesArray = Array.from(aggregate.$fieldValues.values());
        const computedFields = fieldValuesArray.reduce((jsonObj: object, fieldValue: FieldValue) => {
            jsonObj[fieldValue.$field.$name] = fieldValue.$value.value;
            return {...jsonObj};
        }, {});

        const metadata = {aggregateName: aggregate.$name};
        computedFields[this.manager.$symbol] = metadata;

        return computedFields;
    }

    public denormalize(payload: any): Aggregate {
        const tmp = {...payload};
        const mappingAggregate = this.manager.$mappings.get(payload[this.manager.$symbol].aggregateName);
        if (!mappingAggregate) {
            throw new Error("Mapping Aggregate not found!");
        }
        const fieldVals = Object.keys(tmp).map((key) => {
            const gotField = mappingAggregate.$fields.get(key);
            return new FieldValue(gotField, {value: tmp[key]});
        });

        return new Aggregate(mappingAggregate, fieldVals);
    }

    public setAggregateManager(manager: AggregateManager) {
        this.manager = manager;
    }

}

export default JSONDenormalizer;
