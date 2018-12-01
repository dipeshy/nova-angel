import React from 'react';
import { Field, FieldArray } from 'redux-form';
import ListFields from '../ListFields';

export default ({ fields }: { fields: any }) => (
    <React.Fragment>
        <span
            onClick={() => fields.push({})}
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
        {fields.map((member, index) => (
            <li key={member}>
                <span
                    role="presentation"
                    className="icon icon-minus-circled pull-right"
                    style={{
                        cursor: 'pointer',
                        color: '#B02222'
                    }}
                    onClick={() => fields.remove(index)}
                >
                    &nbsp;Remove
                </span>
                <div className="clearfix" />
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <Field
                        className="form-control"
                        name={`${member}.name`}
                        component="input"
                        type="text"
                        placeholder="Docker Container Name"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="image">Image</label>
                    <Field
                        className="form-control"
                        name={`${member}.image`}
                        component="input"
                        type="text"
                        placeholder="Docker image"
                    />
                </div>
                <div className="form-group">
                    <label className="pull-left">Ports</label>
                    <FieldArray
                        name={`${member}.ports`}
                        component={ListFields}
                        props={{ placeholder: '8000:8000' }}
                    />
                </div>
                <div className="form-group">
                    <label className="pull-left">ENV Variables</label>
                    <FieldArray
                        name={`${member}.env`}
                        component={ListFields}
                        props={{ placeholder: 'NODE_ENV=production' }}
                    />
                </div>
                <div className="form-group">
                    <label className="pull-left">Volumes</label>
                    <FieldArray
                        name={`${member}.volumes`}
                        component={ListFields}
                        props={{
                            placeholder:
                                '~/postgresqldata:/var/lib/postgresql/data'
                        }}
                    />
                </div>
            </li>
        ))}
    </React.Fragment>
);
