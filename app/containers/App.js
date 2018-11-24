// @flow
import * as React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';

type Props = {
    children: React.Node
};

export default class App extends React.Component<Props> {
    props: Props;

    render() {
        const { children } = this.props;
        return (
            <React.Fragment>
                <div className="window">
                    <header className="toolbar toolbar-header">
                        <div className="toolbar-actions">
                            <div className="btn-group">
                                <Link
                                    to={routes.HOME}
                                    className="btn btn-default"
                                >
                                    <span className="icon icon-home" />
                                </Link>
                                <Link
                                    to={routes.SERVICES_ADD}
                                    className="btn btn-default"
                                >
                                    <span className="icon icon-plus-circled" />
                                    &nbsp;Add
                                </Link>
                            </div>
                        </div>
                    </header>
                    {children}
                    <footer className="toolbar toolbar-footer">
                        <h1 className="title">2018</h1>
                    </footer>
                </div>
            </React.Fragment>
        );
    }
}
