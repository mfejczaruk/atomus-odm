import Field from "../Mapping/Field";

class AggregateChange {
    private field: Field;
    private old: object;
    private changed: object;

    constructor(field: Field, old: object, changed: object) {
        this.field = field;
        this.old = old;
        this.changed = changed;
    }

    public get $field(): Field {
        return this.field;
    }

    public get $old(): object {
        return this.old;
    }

    public get $changed(): object {
        return this.changed;
    }
}

export default AggregateChange;