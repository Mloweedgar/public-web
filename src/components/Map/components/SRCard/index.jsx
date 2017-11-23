import React, { Component } from 'react';
import styles from './styles.scss';
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);
import { connect } from 'react-redux';
import { unselectMapPoint } from 'actions';
import Moment from 'react-moment';
// import the core library.
import ReactEcharts from 'echarts-for-react/lib/core';
// then import echarts modules those you have used manually.
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import './streamline.css';

const getSRPriorityClass = (priority) => {
    switch (priority) {
        case 'Low':
            return 'priorityLow';
        case 'Normal':
            return 'priorityNormal';
        case 'Critical':
            return 'priorityCritical';
        default:
            return '';
    }
};
const getSRStatusClass = (status) => {
    switch (status) {
        case 'Open':
            return 'statusOpen';
        case 'In Progress':
            return 'statusInProgress';
        case 'Closed':
            return 'statusClosed';
        case 'Escallated':
            return 'statusEscallated';
        default:
            return '';
    }
};

const renderCard = (props, onBackBtnClicked) => {
    const { selectedSR, SRSummary, publicServices } = props;

    let barChartOption;
    if (Object.keys(SRSummary).length) {
        const services = SRSummary.services.filter(service => {
            return publicServices.some(publicService => publicService.name === service.name);
        });
        const barChartData = services.map(service => {
            var serie = {
                name: service.name,
                value: service['count'] / 1000,
                itemStyle: {
                    normal: {
                        color: service.color,
                        label: {
                            show: true,
                            position: 'inside',
                            formatter: function (params) {
                                const value = params.value * 1000;
                                return value.toLocaleString();
                            }
                        }
                    }
                }
            };

            return serie;
        });
        barChartOption = {
            title: {
                text: 'Services Summary'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                    return params[0].name + '<br/>' + params[0].value;
                }
            },
            xAxis: [{
                type: 'category',
                data: barChartData.map(serie => serie.name),
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    rotate: 30,
                    fontSize: 11
                }
            }],
            yAxis: [
                {
                    type: 'value',
                    axisLabel: { formatter: '{value}k' }
                }],
            calculable: true,
            series: [
                {
                    type: 'bar',
                    data: barChartData
                }
            ]
        };
    }
    // const barChartOption = {
    //     xAxis: [{ type: 'category', data: ['male', 'female'] }],
    //     yAxis: [{ type: 'value' }],
    //     series: [
    //         {
    //             type: 'bar',
    //             data: [{ name: 'male', value: 3 },
    //             { name: 'female', value: 8 }]
    //         }
    //     ]
    // };

    if (selectedSR) {
        return (
            <div className={cx('cardContainer')} style={{ zIndex: 500 }}>
                <div className={cx('header', 'navBtn')} onClick={onBackBtnClicked}>
                    <span>&#x3c;</span><span>&#x3c;</span><span> Back to Summary Statistics</span>
                </div>
                <div>
                    <div className={cx('serviceName')}>
                        <span>{selectedSR.service.name}</span>
                    </div>
                    <div className={cx('item')}>
                        <div className={cx('itemTitle', 'horizontal')}>Ticket No:</div>
                        <div className={cx('itemValue', 'horizontal')}>{selectedSR.code}</div>
                    </div>
                    <div className={cx('item', 'grid')}>
                        <div className={cx('itemLeft')}>
                            <div className={cx('itemTitle', 'vertical')}>Address:</div>
                            <div className={cx('itemValue')}>{selectedSR.address}</div>
                        </div>
                        <div className={cx('itemRight')}>
                            <div className={cx('itemTitle', 'vertical')}>Area:</div>
                            <div className={cx('itemValue')}>{selectedSR.jurisdiction.name}</div>
                        </div>
                    </div>
                    <div className={cx('item', 'grid')}>
                        <div className={cx('itemLeft')}>
                            <div className={cx('itemBtn', getSRStatusClass(selectedSR.status.name))}>
                                Status - {selectedSR.status.name}
                            </div>
                        </div>
                        <div className={cx('itemRight')}>
                            <div className={cx('itemBtn', getSRPriorityClass(selectedSR.priority.name))}>
                                Priority - {selectedSR.priority.name}
                            </div>
                        </div>
                    </div>
                    <div className={cx('item', 'last')}>
                        <div className="streamline">
                            {
                                selectedSR.changelogs ?
                                    selectedSR.changelogs.map(changelog => (
                                        <div className="sl-item" key={changelog.id} style={{ borderColor: changelog.status.color }}>
                                            <div className="sl-content">
                                                <div className="sl-date">
                                                    <span className="sl-dateTitle"> {changelog.changer ? changelog.changer.name : ''} </span>
                                                    <Moment format='ddd MMM D, YYYY' date={changelog.createdAt} />
                                                </div>
                                                {
                                                    changelog.status ? (<p>Change status to
                                            <span className='labelBadge' style={{ backgroundColor: changelog.status.color, color: changelog.status.color }}>
                                                            <span className='labelText'>{changelog.status.name}</span>
                                                        </span>
                                                    </p>) : ''
                                                }
                                                {
                                                    changelog.priority ? (<p>Change priority to
                                            <span className='labelBadge' style={{ backgroundColor: changelog.priority.color, color: changelog.priority.color }}>
                                                            <span className='labelText'>{changelog.priority.name}</span>
                                                        </span>
                                                    </p>) : ''
                                                }
                                                {
                                                    changelog.assignee ? (
                                                        <p>
                                                            Assignee to {changelog.assignee.name}
                                                        </p>
                                                    ) : ''
                                                }

                                            </div>
                                        </div>
                                    )) : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className={cx('cardContainer')} style={{ zIndex: 500 }}>
                <div className={cx('header')} >
                    <span> Summary Statistics</span>
                </div>
                <div className={cx('chartItem')}>
                    <div className={cx('chartTitle')}>Services Summary</div>
                    <div>
                        {
                            Object.keys(SRSummary).length ? <ReactEcharts echarts={echarts} notMerge={true}
                                lazyUpdate={true} style={{ height: '250px' }} option={barChartOption} /> : ''
                        }

                    </div>
                </div>
            </div>
        );
    }
};

class SRCard extends Component {
    constructor(props) {
        super(props);
        this.state = { showCard: true };
        //bind functions
        this.onBackBtnClicked = this.onBackBtnClicked.bind(this);
    }

    onBackBtnClicked() {
        this.props.unselectMapPoint();
    }

    render() {
        return renderCard(this.props, this.onBackBtnClicked);
    }
}

const mapStateToProps = (state) => {
    return {
        selectedSR: state.selectedMapPoint,
        SRSummary: state.SRSummary,
        publicServices: state.serviceFilter.services
    };
};

export default connect(mapStateToProps, { unselectMapPoint })(SRCard);