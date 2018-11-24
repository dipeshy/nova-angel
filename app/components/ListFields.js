import React from 'react';
import { Field } from 'redux-form';

export default ({
    fields,
    placeholder
}: {
    fields: any,
    placeholder: string
}) => (
    <React.Fragment>
        <span
            onClick={() => fields.push()}
            role="presentation"
            className="icon icon-plus-circled pull-right"
            style={{
                cursor: 'pointer',
                color: 'green'
            }}
        >
            &nbsp;Add
        </span>
        <div className="clearfix" />
        {fields.map((item, index) => (
            <div key={item.toString()}>
                <span
                    onClick={() => fields.remove(index)}
                    role="presentation"
                    className="icon icon-minus-circled"
                    style={{
                        cursor: 'pointer',
                        color: '#fb2f29'
                    }}
                />
                <Field
                    className="form-control"
                    name={item}
                    component="input"
                    type="text"
                    placeholder={placeholder}
                />
            </div>
        ))}
    </React.Fragment>
);
