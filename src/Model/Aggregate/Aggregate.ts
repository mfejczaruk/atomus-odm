import {v1 as uuid} from "uuid";
import AggregateMapping from "../Mapping/AggregateMapping";
import FieldType from "../Mapping/FieldType";
import ScalarField from "../Mapping/ScalarField";
import AggregateChange from "./AggregateChange";
import AggregateChanges from "./AggregateChanges";
import FieldValue from "./FieldValue";
import Field from "../Mapping/Field";

class Aggregate {
    public static createEmpty(
            name: string,
            aggregateMapping: AggregateMapping,
            fieldValues: FieldValue[] = [],
            ): Aggregate {
        const aggregate = new Aggregate();
        aggregate.name = name;
        aggregate.aggregateMapping = new AggregateMapping(aggregateMapping.$name);
        aggregate.aggregateMapping.$fields.push(...aggregateMapping.$fields);
        aggregate.fieldValues = [...fieldValues];

        const isUuidPresent =
            fieldValues.findIndex( (fieldValue: FieldValue) => fieldValue.$field.$name === "id") !== -1;

        if (!isUuidPresent) {
            const uuidField = new ScalarField("id", FieldType.uuid);
            const uuidFieldValue = new FieldValue(new ScalarField("id", FieldType.uuid), {value: uuid()});
            aggregate.fieldValues.push(uuidFieldValue);
            aggregate.aggregateMapping.$fields.push(uuidField);
        }

        aggregate.initFieldValues();
        aggregate.guardAgainstInconsistency();
        return aggregate;
    }

    private name: string = "";
    private aggregateMapping: AggregateMapping;
    private fieldValues: FieldValue[] = [];

    public id() {
        return this.fieldValues.find((fieldValue) => fieldValue.$field.$name === "id").$value;
    }

    get $fieldValues() {
        return this.fieldValues;
    }

    public computeChanges(dirtyAggregate: Aggregate): AggregateChanges {
        const changes = new AggregateChanges();
        this.$fieldValues.forEach( (fieldValue) => {
            const dirtyFieldValue = dirtyAggregate.$fieldValues
            .find((dirtyElem) => dirtyElem.$field.$name === fieldValue.$field.$name);

            if (dirtyFieldValue === undefined) { throw new Error("Field not found!"); }
            if (JSON.stringify(dirtyFieldValue.$value) !== JSON.stringify(fieldValue.$value)) {
                changes.addChange(new AggregateChange(fieldValue.$field, fieldValue.$value, dirtyFieldValue.$value));
            }
        });

        return changes;
    }

    protected initFieldValues() {
        const emptyAggregateFields: ScalarField[] = this.aggregateMapping.$fields.filter( (aggregateField: Field) => {
            return (this.$fieldValues
                .findIndex((fieldValue: FieldValue) => fieldValue.$field.$name === aggregateField.$name) === -1);
        });

        this.fieldValues.push(...emptyAggregateFields.map( (field) => new FieldValue(field, {}) ));
    }

    private guardAgainstInconsistency() {
        if (this.$fieldValues.length !== this.aggregateMapping.$fields.length) {
            throw new Error("Aggregate incosistent.");
        }

        this.fieldValues.forEach( (fieldValue: FieldValue) => {
            const isPresentInMapping = this.aggregateMapping.$fields.findIndex( (aggregateField: Field) =>
                aggregateField.isEqual(fieldValue.$field));
            if (isPresentInMapping === -1) {
                throw new Error("Aggregate incosistent.");
            }
        });
    }
}

export default Aggregate;