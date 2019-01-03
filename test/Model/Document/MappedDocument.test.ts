import FieldValue from "../../../src/Model/Document/FieldValue";
import MappedDocument from "../../../src/Model/Document/MappedDocument";
import DocumentMapping from "../../../src/Model/Mapping/DocumentMapping";
import Field from "../../../src/Model/Mapping/Field";
import ChildrenField from "../../../src/Model/Mapping/Fields/ChildrenField";
import IdField from "../../../src/Model/Mapping/Fields/IdField";
import StringField from "../../../src/Model/Mapping/Fields/StringField";
import FieldType from "../../../src/Model/Mapping/FieldType";
import { Builder } from "../../Infrastructure/Common/Builder";

describe("MappedDocument", () => {
    const fields = [
        new IdField("id"),
        new StringField("name"),
        new StringField("surname"),
    ];
    const exampleDocumentMapping = new DocumentMapping("test_mapping", fields);

    it("should have id set if created as empty.", () => {
        const document = new MappedDocument(exampleDocumentMapping);
        expect(document.$id).not.toBeNull();
    });

    it("should not have differences to itself.", () => {
        const document = new MappedDocument(exampleDocumentMapping);
        expect(document.computeChanges(document)).toBeFalsy();
    });

    it("should guard against inconsistency.", () => {
        expect(() => {
            const mockFieldValues = [new FieldValue(new StringField("nam1e1"), "1")];
            const document = new MappedDocument(exampleDocumentMapping, mockFieldValues);
        }).toThrowError();
    });

    it("should compute changes if there is different size in children.", () => {
        const childDocumentMapping = Builder
        .mapping("child_lorem")
        .addField(new StringField("child_text"))
        .build();

        const documentMapping = Builder
    .mapping("root_lorem")
    .addField(new StringField("test"))
    .addField(new IdField("id"))
    .addField(new ChildrenField("lorem_childs", childDocumentMapping))
    .build();

        const children = [];
        for (let i = 0; i < 5; i += 1) {
        children.push(Builder
            .mappedDocument(childDocumentMapping)
            .addFieldValue("child_text", "lorem_ipsum" + i)
            .build());
    }

        const mappedDocument = Builder
    .mappedDocument(documentMapping)
    .addFieldValue("id", "9181ee1a-030b-40d3-9d2c-168db5c03c5e")
    .addFieldValue("test", "lorem")
    .addFieldValue("lorem_childs", children)
    .build();

        const documentMock = Builder.documentManager();
        const denormalizer = documentMock.$normalizer;
        documentMock.$mappings.set(documentMapping.$name, documentMapping);
        documentMock.$mappings.set(childDocumentMapping.$name, childDocumentMapping);
        const json = {
            id: "9181ee1a-030b-40d3-9d2c-168db5c03c5e",
            [documentMock.$symbol]: {
                documentName: "root_lorem",
            },
            lorem_childs: [
                {child_text: "lorem_ipsum0"},
                {child_text: "lorem_ipsum1"},
                {child_text: "lorem_ipsum2"},
                {child_text: "lorem_ipsum3"},
                {child_text: "lorem_ipsum4"},
            ],
            test: "lorem",
        };
        expect(denormalizer.normalize(mappedDocument)).toEqual(json);
    });

    it("Should denormalize array of child", () => {
        const childDocumentMapping = Builder
        .mapping("child_lorem")
        .addField(new StringField("child_text"))
        .build();

        const documentMapping = Builder
    .mapping("root_lorem")
    .addField(new StringField("test"))
    .addField(new IdField("id"))
    .addField(new ChildrenField("lorem_childs", childDocumentMapping))
    .build();

        const children = [];
        for (let i = 0; i < 5; i += 1) {
        children.push(Builder
            .mappedDocument(childDocumentMapping)
            .addFieldValue("child_text", "lorem_ipsum" + i)
            .build());
    }

        const mappedDocument = Builder
    .mappedDocument(documentMapping)
    .addFieldValue("id", "9181ee1a-030b-40d3-9d2c-168db5c03c5e")
    .addFieldValue("test", "lorem")
    .addFieldValue("lorem_childs", children)
    .build();

        const secondDocument = Builder
    .mappedDocument(documentMapping)
    .addFieldValue("id", "9181ee1a-030b-40d3-9d2c-168db5c03c5e")
    .addFieldValue("test", "lorem")
    .addFieldValue("lorem_childs", children.slice(0, 2))
    .build();

        expect(mappedDocument.computeChanges(secondDocument)).toBeTruthy();
        expect(secondDocument.computeChanges(mappedDocument)).toBeTruthy();

        expect(mappedDocument.getChildren("lorem_childs")[4].$changes.size).toBe(1);
        expect(mappedDocument.getChildren("lorem_childs")[4].$changes.has("delete")).toBeTruthy();

        expect(secondDocument.getChildren("lorem_childs")[4].$changes.has("child_text")).toBeTruthy();
    });
});
