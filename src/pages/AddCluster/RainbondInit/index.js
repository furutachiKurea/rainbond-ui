/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import { Card, Form, Row, Steps } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { formatMessage, FormattedMessage  } from 'umi-plugin-locale';
import React, { PureComponent } from 'react';
import RainbondClusterInit from '../../../components/Cluster/RainbondClusterInit';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import pageheaderSvg from '@/utils/pageHeaderSvg';
import globalUtil from '../../../utils/global';
import userUtil from '../../../utils/user';

const { Step } = Steps;

@Form.create()
@connect(({ user, list, loading, global, index }) => ({
  user: user.currentUser,
  list,
  loading: loading.models.list,
  rainbondInfo: global.rainbondInfo,
  enterprise: global.enterprise,
  isRegist: global.isRegist,
  oauthLongin: loading.effects['global/creatOauth'],
  overviewInfo: index.overviewInfo
}))
export default class RainbondInit extends PureComponent {
  constructor(props) {
    super(props);
    const { user } = this.props;
    const adminer = userUtil.isCompanyAdmin(user);
    this.state = {
      adminer
    };
  }
  componentWillMount() {
    const { adminer } = this.state;
    const { dispatch } = this.props;
    if (!adminer) {
      dispatch(routerRedux.push(`/`));
    }
  }
  componentDidMount() {
    // this.toClusterList()
  }
  toClusterList = (provider = 'rke') => {
    const { dispatch } = this.props;
    const {
      match: {
        params: { eid }
      }
    } = this.props;
    const TOCLUSTERLIST_PATHS = {
      initializing: '/enterprise/{eid}/provider/{provider}/kclusters/append?event_id={eventId}',
      initialized: '/enterprise/{eid}/provider/{provider}/kclusters?event_id={eventId}',
      installing: '/enterprise/{eid}/provider/{provider}/kclusters?type=installing&event_id={eventId}',
      installed: '/enterprise/{eid}/provider/{provider}/kclusters?event_id={eventId}',
      integrating: '/enterprise/{eid}/provider/{provider}/kclusters/init?event_id={eventId}',
      integrated: '/enterprise/{eid}/provider/{provider}/kclusters/check?event_id={eventId}',
    };
    dispatch({
      type: 'region/fetchClusterInfo',
      payload: {
        cluster_id: ''
      },
      callback: res => {
        if (res && res.status_code === 200) {
          window.localStorage.setItem('event_id', res.bean.event_id)
          const status = res.bean.create_status;
          let path = TOCLUSTERLIST_PATHS[status] || TOCLUSTERLIST_PATHS.initializing;
          path = path.replace('{eid}', eid).replace('{provider}', provider);
          if (path.includes('{eventId}')) {
            path = path.replace('{eventId}', res.bean.event_id);
          }
          dispatch(routerRedux.push(path));
        }
      }
    });
  };

  addClusterOK = () => {
    const { dispatch } = this.props;
    const {
      match: {
        params: { eid }
      }
    } = this.props;
    const enterpriseID = eid || globalUtil.getCurrEnterpriseId()
    dispatch(routerRedux.push(`/enterprise/${enterpriseID}/clusters`));
  };
  preStep = () => {
    const { dispatch } = this.props;
    const {
      match: {
        params: { eid, provider }
      }
    } = this.props;
    const enterpriseID = eid || globalUtil.getCurrEnterpriseId()
    dispatch(
      routerRedux.push(`/enterprise/${enterpriseID}/provider/${provider}/kclusters`)
    );
  };
  nextStep = () => {
    const { dispatch } = this.props;
    const {
      match: {
        params: { eid, provider, clusterID }
      }
    } = this.props;
    const enterpriseID = eid || globalUtil.getCurrEnterpriseId()
    dispatch(
      routerRedux.push(`/enterprise/${enterpriseID}/provider/${provider}/kclusters/check`)
    );
  };
  loadSteps = () => {
    const steps = [
        {
          title: formatMessage({id:'enterpriseColony.addCluster.supplier'})
        },
        {
          title: formatMessage({id:'enterpriseColony.addCluster.cluster'})
        },
        {
          title: formatMessage({id:'enterpriseColony.addCluster.Initialize'})
        },
        {
          title: formatMessage({id : 'enterpriseColony.addCluster.clusterInit'})
        },
        {
          title: formatMessage({id:'enterpriseColony.addCluster.docking'})
        }
    ];
    return steps;
  };
  completeInit = () => {
    const { dispatch } = this.props;
    const {
      match: {
        params: { eid, provider }
      }
    } = this.props;
    const enterpriseID = eid || globalUtil.getCurrEnterpriseId()
    dispatch(
      routerRedux.push(
        `/enterprise/${enterpriseID}/provider/${provider}/kclusters/check`
      )
    );
  };

  render() {
    const {
      match: {
        params: { eid, provider, clusterID, taskID, type }
      }
    } = this.props;
    return (
      <PageHeaderLayout
      title={<FormattedMessage id='enterpriseColony.button.text'/>}
      content={<FormattedMessage id='enterpriseColony.PageHeaderLayout.content'/>}
      titleSvg={pageheaderSvg.getPageHeaderSvg('clusters', 18)}
      >
        <Row style={{ marginBottom: '16px' }}>
          <Steps current={2}>
            {this.loadSteps().map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
        </Row>
        <Row>
          <RainbondClusterInit
            eid={eid}
            completeInit={this.completeInit}
            selectProvider={provider}
            taskID={taskID}
            clusterID={clusterID}
            type={type}
            preStep={this.preStep}
          />
        </Row>
      </PageHeaderLayout>
    );
  }
}
