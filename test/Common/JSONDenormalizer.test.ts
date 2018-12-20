import JSONDenormalizer from "../../src/Common/JSONDenormalizer";
import Aggregate from "../../src/Model/Aggregate/Aggregate";
import FieldValue from "../../src/Model/Aggregate/FieldValue";
import AggregateMapping from "../../src/Model/Mapping/AggregateMapping";
import FieldType from "../../src/Model/Mapping/FieldType";
import ManagedAggregate from "../../src/Model/ODM/ManagedAggregate";
import AggregateManagerMock from "./AggregateManagerMock";
import Field from "../../src/Model/Mapping/Field";


describe("AggregateManager", () => {
    const denormalizer = new JSONDenormalizer();
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
    const aggregateMock = new AggregateManagerMock(denormalizer);
    denormalizer.setAggregateManager(aggregateMock);
    aggregateMock.$mappings.set(aggregateMapping.$name, aggregateMapping);

    it("should map managed aggregate to JSON with metadata.", () => {
        const json = {
            id: "9181ee1a-030b-40d3-9d2c-168db5c03c5e",
            name: "test",
            surname: "ipsum",
            [aggregateMock.$symbol]: {
                aggregateName: "test_aggr",
            },
        };
        const denormalizedJSON = denormalizer.normalize(managedAggregate.$aggregate);
        expect(denormalizedJSON).toEqual(json);
    });

    it("should map JSON with metadata to aggregate.", () => {
        const json = {
            id: "9181ee1a-030b-40d3-9d2c-168db5c03c5e",
            [aggregateMock.$symbol]: {
                aggregateName: "test_aggr",
            },
            name: "test",
            surname: "ipsum",
        };
        const denormalizedAggregate: Aggregate = denormalizer.denormalize(json);
        expect(denormalizedAggregate.computeChanges(aggregate).$changed.size).toEqual(0);
    });
});