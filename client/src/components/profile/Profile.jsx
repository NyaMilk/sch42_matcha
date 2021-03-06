import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    Alert, Container, Row, Col, Nav, NavItem, NavLink, Card, CardImg, CardBody, TabContent, TabPane, Button, Media, Input, Label,
    UncontrolledButtonDropdown, DropdownMenu, DropdownItem, DropdownToggle, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { fetchProfile, fetchView, fetchLike, fetchStatus, fetchUpdateStatus, fetchUpdateView, fetchReport } from '../../redux/profile/ActionCreators';
import { fetchUpdateLogin } from '../../redux/login/ActionCreators';
import { Loading } from '../Loading';
import NotFound from '../notFound';
import { request } from '../../util/http';
import moment from 'moment';
import './Profile.css';
import InfoSpan from '../infoSpan';

const mapStateToProps = (state) => {
    return {
        login: state.login,
        profile: state.profile,
        status: state.status
    }
}

const mapDispatchToProps = (dispatch) => ({
    fetchUpdateLogin: (nickname) => dispatch(fetchUpdateLogin(nickname)),
    fetchProfile: (nickname) => dispatch(fetchProfile(nickname)),
    fetchView: (nickname) => dispatch(fetchView(nickname)),
    fetchLike: (nickname) => dispatch(fetchLike(nickname)),
    fetchStatus: (me, you) => dispatch(fetchStatus(me, you)),
    fetchUpdateView: (me, you) => dispatch(fetchUpdateView(me, you)),
    fetchUpdateStatus: (me, you, status, newStatus) => dispatch(fetchUpdateStatus(me, you, status, newStatus)),
    fetchReport: (data) => dispatch(fetchReport(data))
});

function TagsList(props) {
    let listItems;
    if (props.tags) {
        listItems = props.tags.map((tag, item) =>
            <NavItem className="tags" key={item}>
                <Link to="#">#{tag}</Link>
            </NavItem>
        );
    }
    return (
        <Nav>{listItems}</Nav>
    );
}

function PhotoList(props) {
    const [errItem, setCur] = useState(null);
    const [info, setInfo] = useState(null);
    const [isOpen, toggle] = useState(false);

    function putPhoto(e, item) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const type = e.target.files[0].type;
            if (!type.match("image/png") && !type.match("image/jpeg") && !type.match("image/jpg")) {
                setInfo('Ooops! Wrong file format');
                setCur(item - 1);
                toggle(!isOpen);
                return;
            }
            let formData = new FormData();
            formData.append('photo', file);
            request(`/api/image/${props.me}/${item}`, formData, 'POST', 'image')
                .then(data => {
                    if (data) {
                        props.fetchProfile(props.me);
                        props.fetchUpdateLogin(props.me);
                    }
                })
                .catch(e => {
                    setInfo(e.message);
                })
        }
    }

    let listItems;
    if (props.photos) {
        listItems = props.photos.map((photo, item) =>
            <Col md="4" key={item}>
                <Card className="mb-4 shadow-sm">
                    {
                        (errItem === item) &&
                        <Alert isOpen={isOpen} color="danger" onClick={() => toggle(!isOpen)}>{info}</Alert>
                    }
                    <CardImg src={`/api/image/${props.me}/${item + 1}/${photo[1]}`} alt={"Photo profile"} />
                    {
                        props.check &&
                        <CardBody>
                            <div className="d-flex justify-content-center">
                                <Label className="btn btn-sm btn-success">Add
                                    <Input className="profile-input" type="file" onChange={e => putPhoto(e, item + 1)} />
                                </Label>
                            </div>
                        </CardBody>
                    }
                </Card>
            </Col>
        );
    }
    return (
        <Row>{listItems}</Row>
    );
}

function ViewsList(props) {
    if (props.myviews.length > 0) {
        const listItems = props.myviews.map((view, item) =>
            <Col xs="12" className="mt-4" key={item}>
                <Media>
                    <Media left middle>
                        <Media object src={`/api/image/${view.nickname}/1/${view.photos}`} alt={`Profile photo ${view.nickname}`} />
                    </Media>
                    <Media body className="ml-4">
                        <Media heading>{view.nickname}, {view.age}</Media>
                        <p>{view.about}</p>
                        <p className="profile-tabs-item">
                            {moment(view.visitime).fromNow()}
                        </p>
                        <Link to={`/users/${view.nickname}`} className="btn btn-secondary">Go to profile</Link>
                    </Media>
                </Media>
            </Col>

        );

        return (
            <Row>{listItems}</Row>
        );
    }
    else
        return (
            <span className="font-profile-head font-message">Eventually...</span>
        );
}

function LikesList(props) {
    if (props.mylikes.length > 0) {
        const listItems = props.mylikes.map((like, item) =>
            <Col xs="12" className="mt-4" key={item}>
                <Media>
                    <Media left middle>
                        <Media object src={`/api/image/${like.nickname}/1/${like.photos}`} alt={`Profile photo ${like.nickname}`} />
                    </Media>
                    <Media body className="ml-4">
                        <Media heading>{like.nickname}, {like.age}</Media>
                        <p>{like.about}</p>
                        <p className="profile-tabs-item">
                            {moment(like.time).fromNow()}
                        </p>
                        <Link to={`/users/${like.nickname}`} className="btn btn-secondary">Go to profile</Link>
                    </Media>
                </Media>
            </Col>
        );
        return (
            <Row>{listItems}</Row>
        );
    }
    else
        return (
            <span className="font-profile-head font-message">Eventually...</span>
        );
}

function Report(props) {
    const [modal, setModal] = useState(false);
    const [reason, setReason] = useState("pornography");
    const [message, setMessage] = useState();

    const toggleModal = () => setModal(!modal);

    const reportSubmit = () => {
        const data = {
            me: props.me,
            you: props.you,
            reason: reason,
            message: message
        }
        props.fetch(data);
        setModal(!modal);
    }

    return (
        <div>
            <UncontrolledButtonDropdown>
                <DropdownToggle caret></DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={toggleModal}>Report page</DropdownItem>
                </DropdownMenu>
            </UncontrolledButtonDropdown>
            <Modal isOpen={modal}>
                <ModalHeader>Report user</ModalHeader>
                <ModalBody>
                    <p>Please, let us know the reason why this user should be blocked:</p>
                    <Input className="modal-item" type="select" onChange={e => setReason(e.target.value)}>
                        <option value="pornography">Pornography</option>
                        <option value="spam">Spam</option>
                        <option value="offensive behavior">Offensive behavior</option>
                        <option value="fraud">Fraud</option>
                        <option value="fake">Fake account</option>
                    </Input>
                    <Input type="textarea" placeholder="Descride the reason for the report" rows={5} onChange={e => setMessage(e.target.value)} />
                </ModalBody>
                <ModalFooter className="justify-content-between">
                    <Button color="success" onClick={reportSubmit} reason={reason} message={message} >Report</Button>{' '}
                    <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

function AsideButton(props) {
    const changeStatus = (e) => {
        if (e.target.value === 'like' || e.target.value === 'ignore' || e.target.value === 'unlike') {
            props.fetchUpdateStatus(props.me, props.you, props.status, e.target.value);
        }
    }

    if (props.check) {
        return (
            <Row className="aside-button">
                <span className="logged-status">Online</span>
                <Link to="/edit" className="btn btn-secondary ml-auto d-block">
                    Edit profile
                </Link>
            </Row>
        );
    }
    else {
        return (
            <Row className="aside-button" >
                <span className="logged-status">
                    {
                        props.loggedStatus === 'Online'
                            ? 'Online'
                            : moment(props.lastVisit).fromNow()
                    }
                </span>
                {
                    (props.avatar !== '1.jpg') &&
                    <Button color="danger"
                        value={props.status === 'like' ? 'unlike' : 'like'}
                        onClick={changeStatus}>
                        {props.status === 'like' ? 'Unlike' : 'Like'}
                    </Button>
                }
                {
                    (props.avatar !== '1.jpg') &&
                    <Button color="secondary"
                        className={props.status === 'ignore' ? 'disabled-button' : ''}
                        value='ignore'
                        onClick={changeStatus}>
                        Ignore
                    </Button>
                }
                {
                    (props.avatar !== '1.jpg') &&
                    <Report onClick={changeStatus} me={props.me} you={props.you} fetch={props.fetchReport} />
                }
            </Row>
        );
    }
}

const Profile = (props) => {
    const login = props.login.me.nickname;
    const { nickname } = props.match.params;
    const { status } = props.profile;
    const { fetchProfile, fetchView, fetchLike, fetchStatus, fetchUpdateView } = props;

    useEffect(() => {
        fetchProfile(nickname);
        fetchView(nickname);
        fetchLike(nickname);
        if (login !== nickname) {
            fetchStatus(login, nickname);
            fetchUpdateView(login, nickname);
        }
    }, [nickname, login, status, fetchProfile, fetchView, fetchLike, fetchStatus, fetchUpdateView]);

    const [activeTab, setActiveTab] = useState('1');
    const toggle = tab => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    if (props.profile.isLoading) {
        return (
            <Loading />
        );
    }
    else if (props.profile.errProfile) {
        return (
            <InfoSpan />
        );
    }
    else if (props.profile.info != null && props.profile.info.count_reports > 2) {

        return (
            <section className="page-state">
                <Container>
                    <Row>
                        <Alert color="info">This account has been banned.</Alert>
                    </Row>
                </Container>
            </section>
        );
    }
    else if (props.profile.info != null) {
        const isMe = (props.login.me.nickname === props.match.params.nickname);

        return (
            <section className="profile text-break">
                <Container>
                    <AsideButton check={isMe}
                        status={props.profile.status}
                        me={props.login.me.nickname}
                        you={props.match.params.nickname}
                        avatar={props.login.me.photos[0][1]}
                        loggedStatus={props.profile.info.loggedstatus}
                        lastVisit={props.profile.info.lastvisit}
                        fetchUpdateStatus={props.fetchUpdateStatus}
                        fetchReport={props.fetchReport}
                    />
                    <Row>
                        <Col className="col-lg-3">
                            {
                                props.profile.info.photos &&
                                <img src={`/api/image/${props.profile.info.nickname}/1/${props.profile.info.photos[0][1]}`} alt={`Avatar ${props.profile.info.nickname}`} className="mx-auto d-block profile-avatar rounded-circle" />
                            }
                        </Col>
                        <Col ls="9" className="font-profile-head">
                            <h2>{props.profile.info.nickname}</h2>
                            <p>{props.profile.info.firstname} {props.profile.info.lastname}, {props.profile.info.age}</p>
                            <p>{props.profile.info.sex}</p>
                            <p>{props.profile.info.sexpreferences}</p>
                            <p>{props.profile.info.country}, {props.profile.info.city}</p>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <p className="font-profile-head">Biography</p>
                            <p>{props.profile.info.about}</p>
                        </Col>
                    </Row>

                    {
                        props.profile.info.tags &&
                        <Row>
                            <Col>
                                <p className="font-profile-head">Tags</p>
                                <TagsList tags={props.profile.info.tags} />
                            </Col>
                        </Row>
                    }

                    <p className="font-profile-head">Photo</p>
                    <PhotoList
                        photos={props.profile.info.photos}
                        check={isMe}
                        me={props.profile.info.nickname}
                        fetchProfile={props.fetchProfile}
                        fetchUpdateLogin={props.fetchUpdateLogin}
                    />

                    <Row className="profile-tabs">
                        <Col>
                            <Nav tabs>
                                <NavItem>
                                    <NavLink className={classnames({ active: activeTab === '1' })} onClick={() => { toggle('1'); }}>
                                        Views
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: activeTab === '2' })} onClick={() => { toggle('2'); }}>
                                        Likes
                                </NavLink>
                                </NavItem>
                            </Nav>
                            <TabContent activeTab={activeTab}>
                                <TabPane tabId="1">
                                    <ViewsList myviews={props.profile.views} />
                                </TabPane>
                                <TabPane tabId="2">
                                    <LikesList mylikes={props.profile.likes} />
                                </TabPane>
                            </TabContent>
                        </Col>
                    </Row>
                </Container>
            </section>
        );
    }
    else
        return (
            <NotFound />
        );
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
