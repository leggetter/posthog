import React, { useState } from 'react'
import { useActions, useValues } from 'kea'
import { PersonModal } from './PersonModal'
import {
    ACTIONS_LINE_GRAPH_LINEAR,
    ACTIONS_LINE_GRAPH_CUMULATIVE,
    ACTIONS_TABLE,
    ACTIONS_PIE_CHART,
    ACTIONS_BAR_CHART,
    ACTIONS_BAR_CHART_VALUE,
} from 'lib/constants'

import { ActionsPie, ActionsTable, ActionsLineGraph, ActionsBarValueGraph } from './viz'
import { SaveCohortModal } from './SaveCohortModal'
import { trendsLogic } from './trendsLogic'
import { ViewType } from 'scenes/insights/insightLogic'
import { Button } from 'antd'

interface Props {
    view: ViewType
}

export function TrendInsight({ view }: Props): JSX.Element {
    const [cohortModalVisible, setCohortModalVisible] = useState(false)
    const { filters: _filters, showingPeople, loadMoreBreakdownUrl } = useValues(
        trendsLogic({ dashboardItemId: null, view, filters: null })
    )
    const { saveCohortWithFilters, refreshCohort, loadMoreBreakdown } = useActions(
        trendsLogic({ dashboardItemId: null, view, filters: null })
    )
    return (
        <>
            {(_filters.actions || _filters.events || _filters.session) && (
                <div
                    style={{
                        minHeight: 'calc(90vh - 16rem)',
                        position: 'relative',
                    }}
                >
                    {(!_filters.display ||
                        _filters.display === ACTIONS_LINE_GRAPH_LINEAR ||
                        _filters.display === ACTIONS_LINE_GRAPH_CUMULATIVE ||
                        _filters.display === ACTIONS_BAR_CHART) && <ActionsLineGraph view={view} />}
                    {_filters.display === ACTIONS_TABLE && <ActionsTable filters={_filters} view={view} />}
                    {_filters.display === ACTIONS_PIE_CHART && <ActionsPie filters={_filters} view={view} />}
                    {_filters.display === ACTIONS_BAR_CHART_VALUE && (
                        <ActionsBarValueGraph filters={_filters} view={view} />
                    )}
                </div>
            )}
            {_filters.breakdown && loadMoreBreakdownUrl && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                    <Button style={{ textAlign: 'center' }} onClick={() => loadMoreBreakdown()}>
                        Load more breakdown values
                    </Button>
                </div>
            )}
            <PersonModal
                visible={showingPeople && !cohortModalVisible}
                view={view}
                onSaveCohort={() => {
                    refreshCohort()
                    setCohortModalVisible(true)
                }}
            />
            <SaveCohortModal
                visible={cohortModalVisible}
                onOk={(title: string) => {
                    saveCohortWithFilters(title)
                    setCohortModalVisible(false)
                }}
                onCancel={() => setCohortModalVisible(false)}
            />
        </>
    )
}
