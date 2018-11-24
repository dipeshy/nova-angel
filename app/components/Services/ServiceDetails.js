// @flow
import React, { Component } from 'react';
import { groupBy } from 'ramda';
import { reduxForm, Field, FieldArray, change } from 'redux-form';
import styles from './ServiceDetails.css';
import { ServiceType } from '../../types/service';
import { buildService } from '../../utils/service.utils';

const { dialog } = require('electron').remote;

type Props = {
    createService: (service: ServiceType) => void,
    updateService: (service: ServiceType) => void,
    deleteService: (id: string) => void,
    loadFormData: (data: any) => void,
    dispatch: () => void,
    handleSubmit: any,
    submitting: boolean,
    history: {
        push: () => void
    },
    id: string | null,
    npmscripts: { [key: string]: string }
};

const validate = values => {
    const errors = {};
    if (!values.name) {
        errors.name = 'Required!';
    }
    console.log('VALIDATE', errors);
    return errors;
};

const dockerTasks = ({ fields }: { fields: any }) => (
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
            <li key={member.name}>
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
                        component={listFields}
                        props={{ placeholder: '8000:8000' }}
                    />
                </div>
                <div className="form-group">
                    <label className="pull-left">ENV Variables</label>
                    <FieldArray
                        name={`${member}.env`}
                        component={listFields}
                        props={{ placeholder: 'NODE_ENV=production' }}
                    />
                </div>
                <div className="form-group">
                    <label className="pull-left">Volumes</label>
                    <FieldArray
                        name={`${member}.volumes`}
                        component={listFields}
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
const listFields = ({
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

class ServiceCreate extends Component<Props> {
    props: Props;

    constructor(props) {
        super(props);
        this.dialog = dialog;
    }

    groupByTasks = groupBy(task => task.type);

    handleSubmit = data => {
        const { props } = this;
        const {
            npmscripts,
            createService,
            updateService,
            history
        } = this.props;

        const service: ServiceType = buildService(data, {
            npmscripts
        });

        if (props.id) {
            updateService(service);
        } else {
            createService(service);
        }
        history.push('/');
    };

    handleDelete = () => {
        const { deleteService, id } = this.props;
        if (id) {
            deleteService(id);
        }
        this.redirectHome();
    };

    redirectHome = () => {
        const { history } = this.props;
        history.push('/');
    };

    setProjectDirWithDialog = () => {
        const selectedDirs = this.dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (!(selectedDirs && selectedDirs.length)) {
            return;
        }

        const projectDir = selectedDirs[0];
        const { loadFormData, dispatch } = this.props;
        dispatch(change('service', 'npmscripts', {}));
        loadFormData({
            projectDir
        });
    };

    render() {
        const { handleSubmit, submitting, npmscripts, id } = this.props;
        return (
            <div className="window-content">
                <div className={`${styles.container}`}>
                    <form
                        onSubmit={handleSubmit(data => this.handleSubmit(data))}
                    >
                        <Field name="id" component="input" type="hidden" />
                        <div className="form-group">
                            <label htmlFor="name">Service name</label>
                            <Field
                                className="form-control"
                                name="name"
                                component="input"
                                type="text"
                            />
                        </div>
                        <div className="form-group">
                            <button
                                className="btn btn-default"
                                type="button"
                                onClick={this.setProjectDirWithDialog}
                            >
                                Project Path
                            </button>
                        </div>
                        <Field
                            style={{ width: '100%' }}
                            className="form-control"
                            disabled
                            name="projectDir"
                            component="input"
                            placeholder="Select project path to add editor and load npm scripts"
                            type="text"
                        />
                        <div className="gutter" />
                        <div className="well">
                            <strong>Npm Scripts</strong>
                            {npmscripts &&
                                Object.keys(npmscripts).map(key => (
                                    <div
                                        className="form-group--checkbox"
                                        key={key}
                                    >
                                        <Field
                                            id={key}
                                            name={`npmscripts.${key}`}
                                            component="input"
                                            type="checkbox"
                                        />
                                        <label htmlFor={key}>{key}</label>
                                    </div>
                                ))}
                        </div>
                        <div className="gutter" />
                        <div className="well">
                            <div className="form-group">
                                <label className="pull-left">Dockers</label>
                                <FieldArray
                                    name="dockers"
                                    component={dockerTasks}
                                />
                            </div>
                        </div>
                        <div className="gutter" />
                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-form btn-primary"
                                disabled={submitting}
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={this.redirectHome}
                                className="btn btn-form btn-positive"
                            >
                                {' '}
                                Cancel{' '}
                            </button>
                            {id && (
                                <button
                                    type="button"
                                    onClick={this.handleDelete}
                                    className="btn btn-form btn-negative"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default reduxForm({
    form: 'service',
    validate,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    destroyOnUnmount: true
})(ServiceCreate);
