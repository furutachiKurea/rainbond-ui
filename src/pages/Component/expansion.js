/* eslint-disable react/sort-comp */
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Icon,
  Input,
  message,
  notification,
  Row,
  Select,
  Spin,
  Switch,
  Table,
  AutoComplete,
  Slider
} from 'antd';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import moment from 'moment';
import React, { PureComponent } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Deleteimg from '../../../public/images/delete.png';
import InstanceList from '../../components/AppInstanceList';
import ConfirmModal from '../../components/ConfirmModal';
import NoPermTip from '../../components/NoPermTip';
import { horizontal, vertical } from '../../services/app';
import globalUtil from '../../utils/global';
import PriceCard from '../../components/PriceCard';
import pluginUtil from '../../utils/pulginUtils';
import licenseUtil from '../../utils/license';
import sourceUtil from '../../utils/source';
import AddScaling from './component/AddScaling';
import styles from './Index.less';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import cookie from '../../utils/cookie';


const { Option } = Select;

@connect(
  ({ user, appControl, teamControl, rbdPlugin }) => ({
    currUser: user.currentUser,
    baseInfo: appControl.baseInfo,
    extendInfo: appControl.extendInfo,
    instances: appControl.pods,
    scaling: appControl.scalingRules,
    features: teamControl.features,
    pluginList: rbdPlugin.pluginList
  }),
  null,
  null,
  { pure: false, withRef: true }
)
@Form.create()
export default class Index extends PureComponent {
  constructor(arg) {
    super(arg);
    this.state = {
      new_pods:
        this.props.instances && this.props.instances.new_pods
          ? this.props.instances.new_pods
          : [],
      old_pods:
        this.props.instances && this.props.instances.old_pods
          ? this.props.instances.old_pods
          : [],
      instances: [],
      loading: false,
      showEditAutoScaling: false,
      editRules: false,
      rulesList: [],
      sclaingRecord: [],
      page_num: 1,
      page_size: 10,
      enable: false,
      rulesInfo: false,
      total: 0,
      automaticTelescopic: false,
      addindicators: false,
      toDeleteMnt: false,
      deleteType: '',
      editInfo: false,
      automaLoading: true,
      errorMinNum: '',
      errorMaxNum: '',
      errorCpuValue: '',
      errorMemoryValue: '',
      enableGPU: licenseUtil.haveFeature(this.props.features, 'GPU'),
      language: cookie.get('language') === 'zh-CN' ? true : false,
      dataSource: [],
      showBill: pluginUtil.isInstallPlugin(this.props.pluginList, 'rainbond-bill'),
      memorySliderMin: 1,
      memorySliderMax: 8,
      cpuSliderMin: 1,
      cpuSliderMax: 7,
      memoryMarks: {
        1: '128M',
        2: '256M',
        3: '512M',
        4: '1G',
        5: '2G',
        6: '4G',
        7: '8G',
        8: '16G'
      },
      memoryMarksObj: {
        128: 1,
        256: 2,
        512: 3,
        1024: 4,
        2048: 5,
        4096: 6,
        8192: 7,
        16384: 8
      },
      cpuMarks: {
        1: '100m',
        2: '250m',
        3: '500m',
        4: '1Core',
        5: '2Core',
        6: '4Core',
        7: '8Core',
      },
      cpuMarksObj: {
        100: 1,
        250: 2,
        500: 3,
        1000: 4,
        2000: 5,
        4000: 6,
        8000: 7,
        16000: 8
      },
      cpuValue: 0,
      memoryValue: 0
    };
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.instances.new_pods !== this.state.new_pods ||
      nextProps.instances.old_pods !== this.state.old_pods
    ) {
      this.setState({
        new_pods: nextProps.instances.new_pods || [],
        old_pods: nextProps.instances.old_pods || [],
        instances: (nextProps.instances.new_pods || []).concat(
          nextProps.instances.old_pods || []
        ),
        loading: false
      });
    } else {
      this.setState({
        loading: false
      });
    }
  }
  getPrice = (bool) => {
    const { memoryMarksObj, cpuMarksObj, cpuValue, memoryValue } = this.state;
    if ((cpuValue == 0 && memoryValue == 0) || bool) {
      const extendInfo = this.props.extendInfo;
      const cpuValue = extendInfo?.current_cpu ? extendInfo?.current_cpu : (extendInfo?.current_cpu == 0 ? 0 : 100);
      const memoryValue = extendInfo?.current_memory ? extendInfo?.current_memory : (extendInfo?.current_memory == 0 ? 0 : 512);
      const mValue = memoryMarksObj[memoryValue];
      const cValue = cpuMarksObj[cpuValue];
      this.setState({ cpuValue: cValue, memoryValue: mValue });
    }
  }
  componentDidMount() {
    if (!this.canView()) return;
    if (!this.state.showBill) {      
      this.setState({
        memoryMarks: { 0: formatMessage({ id: 'appOverview.no_limit' }), ...this.state.memoryMarks, 9: '32G' },
        cpuMarks: { 0: formatMessage({ id: 'appOverview.no_limit' }), ...this.state.cpuMarks, 8: '16Core' },
        memoryMarksObj: { 0: 0, ...this.state.memoryMarksObj, 32768: 9 },
        cpuMarksObj: { 0: 0, ...this.state.cpuMarksObj, 16000: 8 },
        memorySliderMax: 9,
        memorySliderMin: 0,
        cpuSliderMax: 8,
        cpuSliderMin: 0
      })
    }
    if (this.props.appDetail && this.props.appDetail.service && this.props.appDetail.service.service_alias) {
      this.getScalingRules();
      this.getScalingRecord();
      this.fetchInstanceInfo();
      this.fetchExtendInfo();
      this.timeClick = setInterval(() => {
        this.fetchInstanceInfo();
      }, 60000);
    } else {
      setTimeout(() => {
        if (this.props.appDetail && this.props.appDetail.service && this.props.appDetail.service.service_alias) {
          this.getScalingRules();
          this.getScalingRecord();
          this.fetchInstanceInfo();
          this.fetchExtendInfo();
          this.timeClick = setInterval(() => {
            this.fetchInstanceInfo();
          }, 60000);
        }
      }, 2000)
    }
  }
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'appControl/clearExtendInfo' });
    this.timeClick && clearInterval(this.timeClick);
  }
  // 是否可以浏览当前界面
  canView() {
    const {
      componentPermissions: { isTelescopic }
    } = this.props;
    return isTelescopic;
  }
  handleVertical = () => {
    const { form, appAlias, extendInfo } = this.props;
    const { getFieldValue } = form;
    const { setUnit } = this.state;
    const memory = getFieldValue('memory');
    const gpu = Number(getFieldValue('gpu'));
    const cpu = Number(getFieldValue('new_cpu'));
    var memoryNum = 0;
    if (setUnit) {
      memoryNum = setUnit == "G" ? memory * 1024 : memory
    } else {
      memoryNum = sourceUtil.getUnit(extendInfo.current_memory) == "G" ? Number(memory * 1024) : Number(memory)
    }
    vertical({
      team_name: globalUtil.getCurrTeamName(),
      app_alias: appAlias,
      new_memory: memoryNum,
      new_gpu: gpu,
      new_cpu: cpu
    }).then(data => {
      if (data && !data.status) {
        notification.success({ message: formatMessage({ id: 'notification.success.operationImplement' }) });
      }
    });
  };
  handleHorizontal = () => {
    const node = this.props.form.getFieldValue('node');
    horizontal({
      team_name: globalUtil.getCurrTeamName(),
      app_alias: this.props.appAlias,
      new_node: node
    }).then(data => {
      if (data && !data.status) {
        notification.success({ message: formatMessage({ id: 'notification.success.operationImplement' }) });
      }
    });
  };

  openEditModal = type => {
    const { dispatch, appDetail } = this.props;
    if (type === 'add') {
      this.setState({ showEditAutoScaling: true });
    } else {
      const { id } = this.state;
      dispatch({
        type: 'appControl/telescopic',
        payload: {
          team_name: globalUtil.getCurrTeamName(),
          rule_id: id,
          service_alias: appDetail.service.service_alias
        },
        callback: res => {
          if (res) {
            if (type === 'close') {
              this.setState(
                {
                  rulesInfo: res.bean
                },
                () => {
                  this.shutDownAutoScaling();
                }
              );
            } else {
              this.setState(
                {
                  rulesInfo: res.bean
                },
                () => {
                  this.changeAutoScaling(this.state.rulesInfo);
                }
              );
            }
          }
        }
      });
    }
  };

  cancelEditAutoScaling = () => {
    this.setState({
      showEditAutoScaling: false,
      addindicators: false,
      rulesInfo: false
    });
  };

  handlePodClick = (podName, manageName) => {
    const adPopup = window.open('about:blank');
    const { appAlias } = this.props;
    if (podName && manageName) {
      this.props.dispatch({
        type: 'appControl/managePod',
        payload: {
          team_name: globalUtil.getCurrTeamName(),
          app_alias: appAlias,
          pod_name: podName,
          manage_name: manageName
        },
        callback: () => {
          adPopup.location.href = `/console/teams/${globalUtil.getCurrTeamName()}/apps/${appAlias}/docker_console/`;
        }
      });
    }
  };
  fetchExtendInfo = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'appControl/fetchExtendInfo',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        app_alias: this.props.appAlias
      },
      handleError: res => {
        if (res && res.status === 403) {
          this.props.dispatch(routerRedux.push('/exception/403'));
        }
      }
    });
  };
  fetchInstanceInfo = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'appControl/fetchPods',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        app_alias: this.props.appAlias
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            // 接口变化
            instances: (res.list.new_pods || []).concat(
              res.list.old_pods || []
            ),
            loading: false
          });
        } else {
          this.setState({
            loading: false
          });
        }
      }
    });
  };

  openAutoScaling = values => {
    this.addScalingRules(values);
  };
  changeAutoScaling = values => {
    this.changeScalingRules(values);
  };
  /** 关闭伸缩 */

  shutDownAutoScaling = () => {
    this.setState({
      automaLoading: true
    });
    const { dispatch, appDetail } = this.props;
    const { rulesInfo, id } = this.state;
    const user = globalUtil.getCurrTeamName();
    const alias = appDetail.service.service_alias;
    dispatch({
      type: 'appControl/changeScalingRules',
      payload: {
        xpa_type: 'hpa',
        metrics: rulesInfo.metrics,
        maxNum: rulesInfo.max_replicas,
        minNum: rulesInfo.min_replicas,
        tenant_name: user,
        service_alias: alias,
        enable: false,
        rule_id: id
      },
      callback: res => {
        if (res && res.status_code === 200) {
          notification.success({ message: formatMessage({ id: 'notification.success.close' }) });
          this.setState(
            {
              showEditAutoScaling: false,
              addindicators: false,
              id: '',
              enable: false
            },
            () => {
              this.getScalingRules();
            }
          );
        } else {
          notification.success({ message: formatMessage({ id: 'notification.error.close' }) });
        }
      }
    });
  };

  /** 添加伸缩 */
  addScalingRules = values => {
    this.setState({
      automaLoading: true
    });
    const { dispatch, appDetail } = this.props;
    const user = globalUtil.getCurrTeamName();
    const alias = appDetail.service.service_alias;

    const metrics = [
      {
        metric_type: 'resource_metrics',
        metric_name: values.selectMemory.indexOf('cpu') > -1 ? 'cpu' : 'memory',
        metric_target_type:
          values.selectMemory.indexOf('utilization') > -1
            ? 'utilization'
            : 'average_value',
        metric_target_value: values.value ? parseInt(values.value) : 0
      }
    ];
    dispatch({
      type: 'appControl/addScalingRules',
      payload: {
        enable: true,
        metrics,
        maxNum: parseInt(values.maxNum),
        minNum: parseInt(values.minNum),
        tenant_name: user,
        service_alias: alias
      },
      callback: res => {
        if (res && res.status_code === 200) {
          notification.success({ message: formatMessage({ id: 'notification.success.open' }) });
          this.setState(
            { showEditAutoScaling: false, addindicators: false },
            () => {
              this.getScalingRules();
            }
          );
        } else {
          this.setState({
            showEditAutoScaling: false,
            addindicators: false,
            loading: false
          });
        }
      }
    });
  };
  /* 编辑伸缩规则 */
  changeScalingRules = values => {
    this.setState({
      automaLoading: true
    });
    const { dispatch, appDetail } = this.props;
    const {
      id,
      addindicators,
      rulesInfo,
      toDeleteMnt,
      automaticTelescopic
    } = this.state;
    const user = globalUtil.getCurrTeamName();
    const alias = appDetail.service.service_alias;
    const arr = rulesInfo && rulesInfo.metrics;

    if (addindicators) {
      arr.push({
        metric_type: 'resource_metrics',
        metric_name: values.selectMemory.indexOf('cpu') > -1 ? 'cpu' : 'memory',
        metric_target_type:
          values.selectMemory.indexOf('utilization') > -1
            ? 'utilization'
            : 'average_value',
        metric_target_value: values.value ? parseInt(values.value) : 0
      });
    }

    const _th = this;
    if (id) {
      dispatch({
        type: 'appControl/changeScalingRules',
        payload: {
          xpa_type: 'hpa',
          enable: true,
          maxNum: values.max_replicas
            ? Number(values.max_replicas)
            : Number(rulesInfo.max_replicas),
          minNum: values.min_replicas
            ? Number(values.min_replicas)
            : Number(rulesInfo.min_replicas),
          metrics: addindicators ? arr : values.metrics,
          tenant_name: user,
          service_alias: alias,
          rule_id: id
        },
        callback: res => {
          if (res && res.status_code === 200) {
            notification.success({
              message: toDeleteMnt
                ? formatMessage({ id: 'notification.success.delete' })
                : !automaticTelescopic
                  ? formatMessage({ id: 'notification.success.open' })
                  : addindicators
                    ? formatMessage({ id: 'notification.success.add' })
                    : formatMessage({ id: 'notification.success.edit' })
            });

            _th.setState(
              {
                showEditAutoScaling: false,
                addindicators: false,
                toDeleteMnt: false,
                id: res.bean.id
              },
              () => {
                _th.getScalingRules();
              }
            );
          } else {
            notification.success({ message: formatMessage({ id: 'notification.success.Failed' }) });
            _th.setState({ showEditAutoScaling: false, addindicators: false });
          }
        }
      });
    }
  };

  /* 获取伸缩规则 */
  getScalingRules = () => {
    const { dispatch, appDetail } = this.props;
    dispatch({
      type: 'appControl/getScalingRules',
      payload: {
        tenant_name: globalUtil.getCurrTeamName(),
        service_alias: appDetail && appDetail.service && appDetail.service.service_alias
      },
      callback: res => {
        if (res && res.status_code === 200) {
          const { list } = res;
          const datavalue = !!(list && list.length > 0);
          this.setState({
            enable: datavalue,
            rulesList: datavalue ? list : [],
            id: list && datavalue ? list[0].rule_id : '',
            editRules: !!(datavalue && list[0].enable),
            automaticTelescopic: !!(datavalue && list[0].enable),
            loading: false,
            automaLoading: false
          });
        } else {
          this.setState({
            loading: false,
            automaLoading: false
          });
        }
      }
    });
  };
  onPageChange = page_num => {
    this.setState({ page_num }, () => {
      this.getScalingRecord();
    });
  };
  /* 获取伸缩记录 */
  getScalingRecord = () => {
    const { dispatch, appDetail } = this.props;
    const { page_num, page_size } = this.state;
    dispatch({
      type: 'appControl/getScalingRecord',
      payload: {
        tenant_name: globalUtil.getCurrTeamName(),
        service_alias: appDetail && appDetail.service && appDetail.service.service_alias,
        page: page_num,
        page_size
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            total: res.bean.total,
            sclaingRecord: res.bean.data
          });
        }
      }
    });
  };

  saveForm = form => {
    this.form = form;
    const { rulesList, enable } = this.state;
    if (enable && this.form) {
      this.form.setFieldsValue(rulesList[0]);
    }
  };

  setMetric_target_value = (arr, types, Symbol = false) => {
    let values = 0;
    arr &&
      arr.length > 0 &&
      arr.map(item => {
        const { metric_name, metric_target_value, metric_target_type } = item;
        if (types === metric_name) {
          values = Symbol ? metric_target_type : metric_target_value;
          return metric_target_value;
        }
      });
    return values === undefined ? 0 : values;
  };

  setMetric_target_show = (arr, types, Symbol = false) => {
    let values = false;
    arr &&
      arr.length > 0 &&
      arr.map(item => {
        const { metric_name } = item;
        if (types === metric_name) {
          values = true;
        }
      });
    return values;
  };

  onChangeAutomaticTelescopic = () => {
    const { enable, automaticTelescopic } = this.state;
    this.openEditModal(automaticTelescopic ? 'close' : enable ? 'edit' : 'add');
  };

  handleSubmit = e => {
    e.preventDefault();
    const { enable } = this.state;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        enable ? this.changeAutoScaling(values) : this.openAutoScaling(values);
      }
    });
  };

  handleAddIndicators = type => {
    const { dispatch, appDetail } = this.props;
    const { id, deleteType, editInfo } = this.state;

    dispatch({
      type: 'appControl/telescopic',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        rule_id: id,
        service_alias: appDetail && appDetail.service && appDetail.service.service_alias
      },
      callback: res => {
        if (res) {
          if (type === 'add') {
            this.setState({
              rulesInfo: res.bean,
              showEditAutoScaling: true,
              addindicators: true
            });
          } else if (type === 'delete') {
            const obj = res.bean;
            obj.metrics.splice(
              obj.metrics.findIndex(item => item.metric_name === deleteType),
              1
            );
            this.changeScalingRules(obj);
          } else if (editInfo) {
            const obj = res.bean;
            obj.max_replicas = Number(editInfo.maxNum);
            obj.min_replicas = Number(editInfo.minNum);
            const arr = res.bean.metrics;
            if (editInfo.cpuValue) {
              arr.map((item, index) => {
                if (item.metric_name == 'cpu') {
                  obj.metrics[index].metric_target_value = Number(
                    editInfo.cpuValue
                  );
                }
              });
            }

            if (editInfo.memoryValue) {
              arr.map((item, index) => {
                if (item.metric_name == 'memory') {
                  obj.metrics[index].metric_target_value = Number(
                    editInfo.memoryValue
                  );
                }
              });
            }
            this.changeScalingRules(obj);
          }
        }
      }
    });
  };
  cancelDeleteMnt = () => {
    this.setState({ toDeleteMnt: null, deleteType: '' });
  };

  handleDeleteMnt = deleteType => {
    this.setState({
      deleteType,
      toDeleteMnt: true
    });
  };

  handlerules = type => {
    const { form } = this.props;
    const { rulesList } = this.state;

    const { getFieldValue, validateFields } = form;
    const rulesInfo = rulesList && rulesList.length > 0 && rulesList[0];
    let num = getFieldValue(type);
    const maxNum = Number(getFieldValue('maxNum'));
    const minNum = Number(getFieldValue('minNum'));
    const cpuValue = Number(getFieldValue('cpuValue'));
    const memoryValue = Number(getFieldValue('memoryValue'));

    const max_replicas = rulesInfo && Number(rulesInfo.max_replicas);
    const min_replicas = rulesInfo && Number(rulesInfo.min_replicas);
    let rulesInfocpuValue = 1;
    let rulesInfomemoryValue = 1;
    if (rulesInfo && rulesInfo.metrics && rulesInfo.metrics.length > 0) {
      rulesInfo.metrics.map(item => {
        if (item.metric_name == 'cpu') {
          rulesInfocpuValue = Number(item.metric_target_value);
        }
        if (item.metric_name == 'memory') {
          rulesInfomemoryValue = Number(item.metric_target_value);
        }
      });
    }
    let errorDesc = '';

    const errorTypeDesc =
      type === 'maxNum'
        ? 'errorMaxNum'
        : type === 'minNum'
          ? 'errorMinNum'
          : type === 'cpuValue'
            ? 'errorCpuValue'
            : 'errorMemoryValue';

    if (num == '' || num == null) {
      this.setState({
        errorDesc: formatMessage({ id: 'componentOverview.body.Expansion.empty' }),
        [errorTypeDesc]: errorDesc,
        errorType: type
      });
      return false;
    }

    num = Number(num);
    const cpuUse =
      rulesInfo && this.setMetric_target_show(rulesInfo.metrics, 'cpu');
    const memoryUse =
      rulesInfo && this.setMetric_target_show(rulesInfo.metrics, 'memory');
    let repeat = true;
    if (
      maxNum === max_replicas &&
      minNum === min_replicas &&
      (cpuUse ? cpuValue === rulesInfocpuValue : true) &&
      (memoryUse ? memoryValue === rulesInfomemoryValue : true)
    ) {
      repeat = false;
    }
    const re = /^[0-9]+.?[0-9]*/;
    if (!re.test(num)) {
      errorDesc = `${formatMessage({ id: 'componentOverview.body.Expansion.enter' })}`;
    } else if (num <= 0 || num > 65535) {
      errorDesc = `${formatMessage({ id: 'componentOverview.body.Expansion.Input' })}`;
    } else if (type === 'minNum' && num > Number(maxNum)) {
      errorDesc = `${formatMessage({ id: 'componentOverview.body.Expansion.max' })}`;
    } else if (type === 'maxNum' && num < Number(minNum)) {
      errorDesc = `${formatMessage({ id: 'componentOverview.body.Expansion.min' })}`;
    } else {
      this.setState(
        {
          [errorTypeDesc]: '',
          errorType: type
        },
        () => {
          const {
            errorMinNum,
            errorMaxNum,
            errorCpuValue,
            errorMemoryValue
          } = this.state;

          if (
            repeat &&
            errorMinNum === '' &&
            errorMaxNum === '' &&
            errorCpuValue === '' &&
            errorMemoryValue === ''
          ) {
            validateFields((_, values) => {
              this.setState(
                {
                  editInfo: values
                },
                () => {
                  this.handleAddIndicators('edit');
                }
              );
            });
          }
          return null;
        }
      );
    }

    this.setState({
      [errorTypeDesc]: errorDesc,
      errorType: type
    });
  };
  selectAfterChange = (val) => {
    this.setState({
      setUnit: val
    })
  }
  handleFromData = () => {
    const { form, appAlias, extendInfo, dispatch } = this.props;
    const { cpuMarksObj, memoryMarksObj } = this.state;
    form.validateFields((err, values) => {
      if (!err) return;
      const { new_memory, new_cpu } = values;
      const memory = Object.keys(memoryMarksObj).find(item => {
        if (memoryMarksObj[item] == new_memory) {
          return item;
        }
      });
      const cpu = Object.keys(cpuMarksObj).find(item => {
        if (cpuMarksObj[item] == new_cpu) {
          return item;
        }
      });
      dispatch({
        type: 'appControl/newVertical',
        payload: {
          team_name: globalUtil.getCurrTeamName(),
          app_alias: appAlias,
          new_memory: Number(memory),
          new_gpu: extendInfo.current_gpu,
          new_cpu: Number(cpu),
          new_node: values.node
        },
        callback: (data) => {
          notification.success({ message: formatMessage({ id: 'notification.success.operationImplement' }) });

        },
        handleError: (err) => {
          notification.error({
            message: err.data.msg_show || '操作失败'
          })

        }
      })
      this.setState({
        editBillInfo: false
      })
    })
  }
  handleMemoryChange = (value) => {
    const { form } = this.props;
    const memoryToCpuMap = {
      0: 0,
      1: 1,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 5,
      7: 6,
      8: 7,
      9: 8
    };
    const newCpuValue = memoryToCpuMap[value] !== undefined ? memoryToCpuMap[value] : 8;
    this.setState({
      memoryValue: value,
      cpuValue: newCpuValue
    }, () => {
      // 在状态更新完成后更新表单值
      form.setFieldsValue({
        new_memory: value,
        new_cpu: newCpuValue
      });
    });
  }
  handleCpuChange = (value) => {
    const { form } = this.props;
    this.setState({
      cpuValue: value
    }, () => {
      // 在状态更新完成后更新表单值
      form.setFieldsValue({
        new_cpu: value
      });
    });
  }
  getFormValues = (data, type) => {
    const { cpuMarksObj, memoryMarksObj } = this.state
    let num = 0
    if (type == 'memory') {
      Object.keys(memoryMarksObj).forEach(item => {
        if (memoryMarksObj[item] == data) {
          num = item
        }
      })
    } else {
      Object.keys(cpuMarksObj).forEach(item => {
        if (cpuMarksObj[item] == data) {
          num = item
        }
      })
    }
    return num
  }
  render() {
    if (!this.canView()) return <NoPermTip />;
    const { extendInfo, appAlias, form, appDetail, method } = this.props;
    let notAllowScaling = false;
    if (appDetail) {
      if (globalUtil.isSingletonComponent(method)) {
        notAllowScaling = true;
      }
    }
    const teamName = globalUtil.getCurrTeamName();
    const regionName = globalUtil.getCurrRegionName();
    const { getFieldDecorator, getFieldValue } = form;
    const {
      page_num,
      page_size,
      total,
      loading,
      rulesList,
      sclaingRecord,
      rulesInfo,
      editRules,
      enable,
      automaticTelescopic,
      showEditAutoScaling,
      addindicators,
      errorMinNum,
      errorMaxNum,
      errorCpuValue,
      errorMemoryValue,
      enableGPU,
      language,
      dataSource,
      setUnit,
      memoryMarks,
      cpuMarks,
      cpuValue,
      memoryValue,
      showBill,
      memorySliderMax,
      memorySliderMin,
      cpuSliderMax,
      cpuSliderMin
    } = this.state;
    if (extendInfo && Object.keys(extendInfo).length > 0) {
      this.getPrice()
    }
    if (!extendInfo) {
      return null;
    } else {
      this.setState({
        dataSource: extendInfo.memory_list || []
      })
    }
    const minNumber = getFieldValue('minNum') || 0;
    const formItemLayout = {
      labelCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 3
        }
      },
      wrapperCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 21
        }
      }
    };
    const grctlCmd = `grctl service get ${appAlias} -t ${globalUtil.getCurrTeamName()}`;
    const MemoryList = [];
    const cpuUse =
      rulesList &&
      rulesList.length > 0 &&
      this.setMetric_target_show(rulesList[0].metrics, 'cpu');
    const memoryUse =
      rulesList &&
      rulesList.length > 0 &&
      this.setMetric_target_show(rulesList[0].metrics, 'memory');

    if (!cpuUse) {
      MemoryList.push(
        { value: 'cpuaverage_value', name: formatMessage({ id: 'componentOverview.body.Expansion.cup_usage' }) },
        { value: 'cpuutilization', name: formatMessage({ id: 'componentOverview.body.Expansion.cpu_use' }) }
      );
    }
    if (!memoryUse) {
      MemoryList.push(
        { value: 'memoryaverage_value', name: formatMessage({ id: 'componentOverview.body.Expansion.usage' }) },
        { value: 'memoryutilization', name: formatMessage({ id: 'componentOverview.body.Expansion.use' }) }
      );
    }
    const descBox = text => <div className={styles.remindDesc}>{text}</div>;
    return (
      <div>
        <Card
          className={styles.InstancesCard}
          title={<FormattedMessage id='componentOverview.body.Expansion.instance' />}
          extra={
            <Button
              onClick={() => {
                this.setState(
                  {
                    loading: true
                  },
                  () => {
                    this.fetchInstanceInfo();
                  }
                );
              }}
              icon='reload'
            >
              <FormattedMessage id='componentOverview.body.Expansion.refresh' />
            </Button>
          }
        >
          {loading ? (
            <Spin tip="Loading...">
              <div style={{ minHeight: '190px' }} />
            </Spin>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 24 }}>
              <InstanceList
                method={method}
                handlePodClick={this.handlePodClick}
                list={this.state.instances}
                serviceID={this.props.appDetail && this.props.appDetail.service && this.props.appDetail.service.service_id}
                k8s_component_name={
                  this.props.appDetail.service.k8s_component_name
                }
              />
            </div>
          )}
        </Card>

        {notAllowScaling && (
          <Alert
            style={{ marginTop: '16px' }}
            message={
              <p style={{ marginBottom: 0 }}>
                <FormattedMessage id='componentOverview.body.Expansion.modify' />
                {' '}
                <Link
                  to={`/team/${teamName}/region/${regionName}/components/${appAlias}/setting`}
                >
                  <FormattedMessage id='componentOverview.body.Expansion.set' />
                </Link>
              </p>
            }
            type="warning"
          />
        )}
        {/* 手动伸缩   */}
        <Card
          className={styles.clerBorder}
          border={false}
          title={<FormattedMessage id='componentOverview.body.Expansion.telescopic' />}
          extra={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {this.state.editBillInfo && showBill &&
                <PriceCard
                  key={cpuValue * memoryValue}
                  type='title'
                  cpu_use={this.getFormValues(cpuValue, 'cpu')}
                  memory_use={this.getFormValues(memoryValue, 'memory')}
                />
              }
              {this.state.editBillInfo ?
                <div style={{ marginLeft: 10 }}>
                  <Button type='primary' icon='save' style={{ marginRight: 10 }} onClick={this.handleFromData}>
                    {formatMessage({ id: 'appPublish.table.btn.confirm' })}
                  </Button>
                  <Button icon='close-circle' onClick={() => {
                    const { memoryMarksObj, cpuMarksObj } = this.state;
                    const { form } = this.props;
                    const extendInfo = this.props.extendInfo;
                    const cpuValue = extendInfo?.current_cpu ? extendInfo?.current_cpu : (extendInfo?.current_cpu == 0 ? 0 : 100);
                    const memoryValue = extendInfo?.current_memory ? extendInfo?.current_memory : (extendInfo?.current_memory == 0 ? 0 : 512);
                    const mValue = memoryMarksObj[memoryValue];
                    const cValue = cpuMarksObj[cpuValue];
                    this.setState({
                      cpuValue: cValue,
                      memoryValue: mValue,
                      editBillInfo: false
                    }, () => {
                      // 在状态更新完成后恢复表单值
                      form.setFieldsValue({
                        new_memory: mValue,
                        new_cpu: cValue
                      });
                    });
                  }}>
                    {formatMessage({ id: 'appPublish.table.btn.cancel' })}
                  </Button>
                </div>
                :
                <Button icon='edit' onClick={() => this.setState({ editBillInfo: true })}>
                  {formatMessage({ id: 'componentOverview.body.tab.env.table.column.edit' })}
                </Button>
              }
            </div>
          }
        >
          <Form hideRequiredMark className={styles.fromItem} onSubmit={this.handleFromData} >
            <Form.Item {...formItemLayout} label={formatMessage({ id: 'componentCheck.advanced.setup.basic_info.label.min_memory' })}>
              {getFieldDecorator('new_memory', {
                initialValue: memoryValue,
              })(
                <Slider
                  disabled={!this.state.editBillInfo}
                  style={{ width: '500px' }}
                  marks={memoryMarks}
                  min={memorySliderMin}
                  max={memorySliderMax}
                  step={null}
                  onChange={this.handleMemoryChange}
                  tooltipVisible={false}
                />
              )}
            </Form.Item>
            <Form.Item {...formItemLayout} label={formatMessage({ id: 'componentCheck.advanced.setup.basic_info.label.min_cpu' })}>
              {getFieldDecorator('new_cpu', {
                initialValue: cpuValue,
              })(
                <Slider
                  disabled={!this.state.editBillInfo}
                  style={{ width: '500px' }}
                  marks={cpuMarks}
                  min={cpuSliderMin}
                  max={cpuSliderMax}
                  step={null}
                  onChange={this.handleCpuChange}
                  tooltipVisible={false}
                />
              )}
            </Form.Item>
            <Form.Item
              label={<FormattedMessage id='componentOverview.body.Expansion.number' />}
              {...formItemLayout}
            >
              {getFieldDecorator('node', {
                initialValue: extendInfo.current_node
              })(
                <Select
                  disabled={!this.state.editBillInfo}
                  style={{ width: 500 }}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {(extendInfo.node_list || []).map(item => (
                    <Option key={item} value={item}>
                      {item}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Form>
        </Card>
        {/* 自动伸缩 */}
        {
          method != 'vm' &&
          <Card
            style={{ marginTop: 16 }}
            className={styles.clearCard}
            title={<FormattedMessage id='componentOverview.body.Expansion.flex' />}
            extra={
              automaticTelescopic && this.state.showBill &&
              <PriceCard
                key={(rulesList && rulesList.length > 0 && rulesList[0].min_replicas) * (rulesList && rulesList.length > 0 && rulesList[0].max_replicas)}
                type='title'
                cpu_use={this.getFormValues(cpuValue, 'cpu')}
                memory_use={this.getFormValues(memoryValue, 'memory')}
                section={true}
                min_node={rulesList && rulesList.length > 0 && rulesList[0].min_replicas || 0}
                max_node={rulesList && rulesList.length > 0 && rulesList[0].max_replicas || 1}
              />
            }
          >
            <Row gutter={24} className={styles.automaTictelescopingBOX}>
              <Col span={12} className={language ? styles.automaTictelescopingTitle : styles.en_automaTictelescopingTitle}>
                <div><FormattedMessage id='componentOverview.body.Expansion.switch' /></div>
                <div><FormattedMessage id='componentOverview.body.Expansion.minNumber' /></div>
                <div><FormattedMessage id='componentOverview.body.Expansion.maxNumber' /></div>
              </Col>
              <Col span={12} className={styles.automaTictelescopingTitle}>
                {cpuUse && (
                  <div>
                    <FormattedMessage id='componentOverview.body.Expansion.CPU_usage' />
                    {this.setMetric_target_value(
                      rulesList[0].metrics,
                      'cpu',
                      true
                    ) === 'utilization'
                      ? <FormattedMessage id='componentOverview.body.Expansion.rate' />
                      : <FormattedMessage id='componentOverview.body.Expansion.amount_m' />}
                    {memoryUse && (
                      <img
                        src={Deleteimg}
                        alt=""
                        onClick={() => {
                          this.handleDeleteMnt('cpu');
                        }}
                      />
                    )}
                  </div>
                )}
                {memoryUse && (
                  <div>
                    <FormattedMessage id='componentOverview.body.Expansion.CPU_umemory' />
                    {this.setMetric_target_value(
                      rulesList[0].metrics,
                      'memory',
                      true
                    ) === 'utilization'
                      ? <FormattedMessage id='componentOverview.body.Expansion.rate' />
                      : <FormattedMessage id='componentOverview.body.Expansion.amount_mi' />}
                    {cpuUse && (
                      <img
                        src={Deleteimg}
                        alt=""
                        onClick={() => {
                          this.handleDeleteMnt('memory');
                        }}
                      />
                    )}
                  </div>
                )}
              </Col>
            </Row>
            <Spin spinning={this.state.automaLoading}>
              <Form
                layout="inline"
                hideRequiredMark
                className={styles.fromItem}
                onSubmit={this.handleSubmit}
              >
                <Row gutter={24} className={styles.automaTictelescoping}>
                  <Col span={12}>
                    <div className={styles.automaTictelescopingContent}>
                      <Switch
                        disabled={notAllowScaling}
                        className={styles.automaTictelescopingSwitch}
                        checked={automaticTelescopic}
                        onClick={() => {
                          this.onChangeAutomaticTelescopic();
                        }}
                      />
                    </div>

                    <div className={styles.automaTictelescopingContent}>
                      {getFieldDecorator('minNum', {
                        initialValue:
                          (rulesList &&
                            rulesList.length > 0 &&
                            rulesList[0].min_replicas) ||
                          0
                      })(
                        <Input
                          disabled={!automaticTelescopic}
                          onBlur={e => {
                            this.handlerules('minNum');
                          }}
                        />
                      )}
                    </div>

                    <div className={styles.automaTictelescopingContent}>
                      {getFieldDecorator('maxNum', {
                        initialValue:
                          (rulesList &&
                            rulesList.length > 0 &&
                            rulesList[0].max_replicas) ||
                          1,
                        rules: [
                          {
                            pattern: new RegExp(/^[0-9]\d*$/, 'g'),
                            message: formatMessage({ id: 'componentOverview.body.Expansion.enter' })
                          },
                          { required: true, message: formatMessage({ id: 'componentOverview.body.Expansion.input_num_max' }) },
                          { validator: this.checkContent }
                        ]
                      })(
                        <Input
                          disabled={!automaticTelescopic}
                          min={minNumber}
                          onBlur={e => {
                            this.handlerules('maxNum');
                          }}
                        />
                      )}
                    </div>
                  </Col>
                  <Col span={12}>
                    {cpuUse && (
                      <div className={styles.automaTictelescopingContent}>
                        {getFieldDecorator('cpuValue', {
                          initialValue:
                            this.setMetric_target_value(
                              rulesList[0].metrics,
                              'cpu'
                            ) || 1,
                          rules: [
                            {
                              pattern: new RegExp(/^[0-9]\d*$/, 'g'),
                              message: formatMessage({ id: 'componentOverview.body.Expansion.enter' })
                            },
                            { required: true, message: formatMessage({ id: 'componentOverview.body.Expansion.input_cup' }) },
                            { validator: this.checkContent }
                          ]
                        })(
                          <Input
                            disabled={!automaticTelescopic}
                            onBlur={e => {
                              this.handlerules('cpuValue');
                            }}
                          />
                        )}
                      </div>
                    )}

                    {memoryUse && (
                      <div className={styles.automaTictelescopingContent}>
                        {getFieldDecorator('memoryValue', {
                          initialValue:
                            this.setMetric_target_value(
                              rulesList[0].metrics,
                              'memory'
                            ) || 1,
                          rules: [
                            {
                              pattern: new RegExp(/^[0-9]\d*$/, 'g'),
                              message: formatMessage({ id: 'componentOverview.body.Expansion.enter' })
                            },
                            { required: true, message: formatMessage({ id: 'componentOverview.body.Expansion.input_memory' }) },
                            { validator: this.checkContent }
                          ]
                        })(
                          <Input
                            disabled={!automaticTelescopic}
                            onBlur={e => {
                              this.handlerules('memoryValue');
                            }}
                          />
                        )}
                      </div>
                    )}
                    {!cpuUse && <div style={{ height: '56px' }} />}
                    {!memoryUse && <div style={{ height: '56px' }} />}

                    <div className={styles.automaTictelescopingContent}>
                      {automaticTelescopic &&
                        <Icon
                          type="plus"
                          style={{ fontSize: '23px' }}
                          onClick={() => {
                            MemoryList.length > 0 &&
                              automaticTelescopic &&
                              this.handleAddIndicators('add');
                          }}
                        />
                      }
                    </div>
                  </Col>
                </Row>
              </Form>
            </Spin>

            <Row gutter={24} className={styles.errorDescBox}>
              <Col span={12} className={styles.automaTictelescopingTitle}>
                <div />
                <div>
                  <span className={styles.errorDesc}>{errorMinNum}</span>
                </div>
                <div>
                  <span className={styles.errorDesc}> {errorMaxNum}</span>
                </div>
              </Col>
              <Col span={12} className={styles.automaTictelescopingTitle}>
                {cpuUse && (
                  <div>
                    <span className={styles.errorDesc}>{errorCpuValue}</span>
                  </div>
                )}
                {memoryUse && (
                  <div>
                    <span className={styles.errorDesc}>{errorMemoryValue}</span>
                  </div>
                )}
              </Col>
            </Row>
          </Card>
        }
        {
          this.state.toDeleteMnt && (
            <ConfirmModal
              title={<FormattedMessage id="confirmModal.deldete.index.title" />}
              desc={<FormattedMessage id="confirmModal.deldete.index.desc" />}
              onCancel={this.cancelDeleteMnt}
              onOk={() => {
                this.handleAddIndicators('delete');
              }}
            />
          )
        }
        {
          showEditAutoScaling && (
            <AddScaling
              data={rulesInfo}
              ref={this.saveForm}
              isvisable={showEditAutoScaling}
              isaddindicators={addindicators}
              memoryList={MemoryList}
              onClose={this.cancelEditAutoScaling}
              onOk={values => {
                enable
                  ? this.changeAutoScaling(values)
                  : this.openAutoScaling(values);
              }}
              editRules={editRules}
            />
          )
        }
        {
          method != 'vm' &&
          <Card
            className={styles.clearCard}
            style={{ marginTop: 16 }}
            title={<FormattedMessage id='componentOverview.body.Expansion.horizontal' />}
          >
            <Table
              className={styles.horizontalExpansionRecordTable}
              rowKey={(record, index) => index}
              dataSource={sclaingRecord}
              pagination={total > page_size ? {
                current: page_num,
                pageSize: page_size,
                total,
                onChange: this.onPageChange
              } : false}
              columns={[
                {
                  title: formatMessage({ id: 'componentOverview.body.Expansion.time' }),
                  dataIndex: 'last_time',
                  key: 'last_time',
                  align: 'center',
                  width: '18%',
                  render: val => (
                    <div
                      style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
                    >
                      {moment(val)
                        .locale('zh-cn')
                        .format('YYYY-MM-DD HH:mm:ss')}
                    </div>
                  )
                },
                {
                  title: formatMessage({ id: 'componentOverview.body.Expansion.telescopicDetails' }),
                  dataIndex: 'description',
                  key: 'description',
                  align: 'center',
                  width: '43%',
                  render: description => (
                    <div
                      style={{
                        textAlign: 'left',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word'
                      }}
                    >
                      {description}
                    </div>
                  )
                },
                {
                  title: formatMessage({ id: 'componentOverview.body.Expansion.type' }),
                  dataIndex: 'record_type',
                  key: 'record_type',
                  align: 'center',
                  width: '13%',
                  render: record_type => (
                    <div>
                      {record_type === 'hpa'
                        ? <FormattedMessage id='componentOverview.body.Expansion.horizontalAutomatic' />
                        : record_type === 'manual'
                          ? <FormattedMessage id='componentOverview.body.Expansion.manualTelescopic' />
                          : <FormattedMessage id='componentOverview.body.Expansion.vertical' />}
                    </div>
                  )
                },
                {
                  title: formatMessage({ id: 'componentOverview.body.Expansion.operator' }),
                  dataIndex: 'operator',
                  key: 'operator',
                  align: 'center',
                  width: '13%',
                  render: operator => {
                    return <span> {operator || '-'} </span>;
                  }
                },
                {
                  title: formatMessage({ id: 'componentOverview.body.Expansion.reason' }),
                  dataIndex: 'reason',
                  align: 'center',
                  key: 'reason',
                  width: '13%'
                }
              ]}
            />
          </Card>
        }
      </div >
    );
  }
}
