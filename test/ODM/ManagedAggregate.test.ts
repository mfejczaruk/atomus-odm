import Aggregate from "../../src/Model/Aggregate/Aggregate";
import AggregateChanges from "../../src/Model/Aggregate/AggregateChanges";
import FieldValue from "../../src/Model/Aggregate/FieldValue";
import AggregateMapping from "../../src/Model/Mapping/AggregateMapping";
import FieldType from "../../src/Model/Mapping/FieldType";
import ManagedAggregate from "../../src/Model/ODM/ManagedAggregate";
import Field from "../../src/Model/Mapping/Field";

describe("ManagedAggregate", () => {
    it("should have getters/setters.", () => {
        const nameField = new Field("name", FieldType.string);
        const surnameField = new Field("surname", FieldType.string);
        const idField = new Field("id", FieldType.uuid);

        const fields = [nameField, surnameField, idField];
        const fieldValues = [
            new FieldValue(nameField, {value: "test"}),
            new FieldValue(surnameField, {value: "ipsum"}),
            new FieldValue(idField, {value: "9181ee1a-030b-40d3-9d2c-168db5c03c5e"}),
        ];
        const aggregateMapping = new AggregateMapping("test_aggr", fields);
        const aggregate = new Aggregate(aggregateMapping, fieldValues);
        const managedAggregate = new ManagedAggregate(aggregate);
        expect(managedAggregate.$aggregate).toBe(aggregate);
    });
});
