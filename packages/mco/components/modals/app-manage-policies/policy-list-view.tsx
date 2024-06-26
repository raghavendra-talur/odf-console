import * as React from 'react';
import { DRPolicyKind, DRPlacementControlKind } from '@odf/mco/types';
import { ActionDropdown } from '@odf/shared/dropdown/action-dropdown';
import { StatusBox } from '@odf/shared/generic/status-box';
import { ModalBody } from '@odf/shared/modals/Modal';
import { getName } from '@odf/shared/selectors';
import { useCustomTranslation } from '@odf/shared/useCustomTranslationHook';
import { getPageRange } from '@odf/shared/utils';
import { getErrorMessage } from '@odf/shared/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { global_palette_blue_300 as blueInfoColor } from '@patternfly/react-tokens/dist/js/global_palette_blue_300';
import { Trans } from 'react-i18next';
import {
  Button,
  Pagination,
  PaginationVariant,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Text,
  AlertVariant,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateHeader,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { DISCOVERED_APP_NS } from '../../../constants';
import { getDRPlacementControlResourceObj } from '../../../hooks';
import { Messages } from './helper/messages';
import { PolicyListViewTable } from './helper/policy-list-view-table';
import { unAssignPromises } from './utils/k8s-utils';
import {
  ManagePolicyStateType,
  MessageType,
  ModalActionContext,
  ModalViewContext,
  PolicyListViewState,
} from './utils/reducer';
import { ManagePolicyStateAction } from './utils/reducer';
import {
  DataPolicyType,
  DRPlacementControlType,
  DRPolicyType,
} from './utils/types';
import './style.scss';

const INITIAL_PAGE_NUMBER = 1;
const COUNT_PER_PAGE_NUMBER = 4;

const filterPolicies = (dataPolicyInfo: DataPolicyType[], searchText: string) =>
  dataPolicyInfo.filter((policy) =>
    getName(policy).toLowerCase().includes(searchText)
  );

// **Note: PatternFly change the fn signature
// From: (value: string, event: React.FormEvent<HTMLInputElement>) => void
// To: (_event: React.FormEvent<HTMLInputElement>, value: string) => void
// both cases need to be handled for backwards compatibility
const onChange = (input: string | React.FormEvent<HTMLInputElement>) => {
  const searchValue =
    typeof input === 'string'
      ? input
      : (input.target as HTMLInputElement)?.value;
  return searchValue;
};

const checkNamespaceProtected = (
  workloadNamespace: string,
  eligiblePolicies: DRPolicyKind[],
  drpcs: DRPlacementControlKind[]
): boolean =>
  drpcs?.some((drpc) => {
    const isNamespaceProtected =
      drpc.spec?.protectedNamespaces?.includes(workloadNamespace);
    const isPolicyMatching = eligiblePolicies?.some(
      (policy) => getName(policy) === drpc.spec.drPolicyRef.name
    );
    return isNamespaceProtected && isPolicyMatching;
  });

export const PolicyListViewToolBar: React.FC<PolicyListViewToolBarProps> = ({
  selectedPolicyCount,
  searchText,
  isActionDisabled,
  isActionHidden,
  isSearchHidden,
  onSearchChange,
  setModalActionContext,
  setMessage,
}) => {
  const { t } = useCustomTranslation();
  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem>
          {!isSearchHidden && (
            <SearchInput
              placeholder={t('Search')}
              aria-label={t('Search input')}
              value={searchText}
              onChange={(value) => onSearchChange(onChange(value))}
              onClear={() => onSearchChange('')}
            />
          )}
        </ToolbarItem>
        <ToolbarItem>
          {!isActionHidden && (
            <ActionDropdown
              id="secondary-actions"
              aria-label={t('Secondary actions')}
              text={t('Actions')}
              toggleVariant={'primary'}
              isDisabled={isActionDisabled}
              onSelect={(id: ModalActionContext) => {
                setModalActionContext(id);
                setMessage({
                  title: t(
                    'Selected policies ({{ count }}) will be removed for your application. This may have some affect on other applications sharing the placement.',
                    { count: selectedPolicyCount }
                  ),
                });
              }}
              dropdownItems={[
                {
                  id: ModalActionContext.UN_ASSIGNING_POLICIES,
                  text: t('Unassign policy'),
                },
              ]}
            />
          )}
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export const PolicyListView: React.FC<PolicyListViewProps> = ({
  dataPolicyInfo,
  workloadNamespace,
  eligiblePolicies,
  state,
  dispatch,
  setModalContext,
  setModalActionContext,
  setMessage,
  loaded,
  loadError,
}) => {
  const { t } = useCustomTranslation();
  const [page, setPage] = React.useState(INITIAL_PAGE_NUMBER);
  const [perPage, setPerPage] = React.useState(COUNT_PER_PAGE_NUMBER);
  const [searchText, onSearchChange] = React.useState('');
  const [start, end] = getPageRange(page, perPage);
  const policies = filterPolicies(dataPolicyInfo ?? [], searchText ?? '') || [];
  const paginatedPolicies = policies.slice(start, end);
  const unFilteredAssignedPolicyLength = dataPolicyInfo?.length;

  const setPolicies = (selectedPolicies: DataPolicyType[]) =>
    dispatch({
      type: ManagePolicyStateType.SET_SELECTED_POLICIES,
      context: ModalViewContext.POLICY_LIST_VIEW,
      payload: selectedPolicies,
    });

  const [discoveredApps, discoveredAppsLoaded, discoveredAppsLoadError] =
    useK8sWatchResource<DRPlacementControlKind[]>(
      getDRPlacementControlResourceObj({
        namespace: DISCOVERED_APP_NS,
      })
    );

  const allLoaded = loaded && discoveredAppsLoaded;
  const anyLoadError = loadError || discoveredAppsLoadError;

  const isNamespaceProtected = checkNamespaceProtected(
    workloadNamespace,
    eligiblePolicies,
    discoveredApps
  );

  const setPolicy = (
    policy: DataPolicyType,
    modalViewContext: ModalViewContext
  ) =>
    dispatch({
      type: ManagePolicyStateType.SET_SELECTED_POLICY,
      context: modalViewContext,
      payload: policy,
    });

  const unAssignPolicies = () => {
    // unassign DRPolicy
    const drpcs: DRPlacementControlType[] = state.policies.reduce(
      (acc, policy) => [...acc, ...policy?.placementControlInfo],
      []
    );
    const promises = unAssignPromises(drpcs);
    Promise.all(promises)
      .then(() => {
        setMessage({
          title: t(
            'Selected policies ({{ count }}) unassigned for the application.',
            { count: state.policies.length }
          ),
          variant: AlertVariant.success,
        });
        dispatch({
          type: ManagePolicyStateType.SET_SELECTED_POLICIES,
          context: ModalViewContext.POLICY_LIST_VIEW,
          payload: [],
        });
        setModalActionContext(ModalActionContext.UN_ASSIGN_POLICIES_SUCCEEDED);
      })
      .catch((error) => {
        setMessage({
          title: t(
            'Unable to unassign all selected policies for the application.'
          ),
          description: getErrorMessage(error),
          variant: AlertVariant.danger,
        });
        setModalActionContext(ModalActionContext.UN_ASSIGN_POLICIES_FAILED);
      });
  };

  return (
    <ModalBody>
      {allLoaded && !anyLoadError ? (
        <>
          <div className="mco-manage-policies__header">
            <Text component="h3"> {t('My assigned policies')} </Text>
            <Button
              variant="primary"
              id="primary-action"
              isDisabled={!!state.policies.length || isNamespaceProtected}
              onClick={() =>
                setModalContext(ModalViewContext.ASSIGN_POLICY_VIEW)
              }
            >
              {t('Enroll application')}
            </Button>
          </div>
          <PolicyListViewToolBar
            selectedPolicyCount={state.policies.length}
            searchText={searchText}
            isActionDisabled={!state.policies.length}
            onSearchChange={onSearchChange}
            setModalActionContext={setModalActionContext}
            setMessage={setMessage}
            isActionHidden
            isSearchHidden={!unFilteredAssignedPolicyLength}
          />
          <div className="mco-manage-policies__col-padding">
            {unFilteredAssignedPolicyLength === 0 ? (
              <EmptyState
                variant={EmptyStateVariant.lg}
                className="mco-manage-policies__emptyState---margin-bottom"
              >
                <EmptyStateHeader
                  titleText={
                    isNamespaceProtected ? (
                      <>
                        {t('Application already enrolled in disaster recovery')}
                      </>
                    ) : (
                      <>{t('No assigned disaster recovery policy found')}</>
                    )
                  }
                  icon={
                    <EmptyStateIcon
                      icon={InfoCircleIcon}
                      color={blueInfoColor.value}
                    />
                  }
                  headingLevel="h3"
                />
                <EmptyStateBody>
                  {isNamespaceProtected ? (
                    <Trans t={t} ns="plugin__odf-console">
                      <p>
                        This managed application namespace is already DR
                        protected. You may have protected this namespace while
                        enrolling discovered applications.
                      </p>
                      <p className="pf-v5-u-mt-md">
                        To see disaster recovery information for your
                        applications, go to{' '}
                        <strong>Protected applications</strong> under{' '}
                        <strong>Disaster Recovery</strong>.
                      </p>
                    </Trans>
                  ) : (
                    <Trans t={t}>
                      You have not enrolled this application yet. To protect
                      your application, click{' '}
                      <strong>Enroll application.</strong>
                    </Trans>
                  )}
                </EmptyStateBody>
              </EmptyState>
            ) : (
              <>
                <Messages
                  state={state}
                  OnCancel={() => setModalActionContext(null)}
                  OnConfirm={unAssignPolicies}
                />
                <PolicyListViewTable
                  policies={paginatedPolicies}
                  selectedPolicies={state.policies}
                  modalActionContext={state.modalActionContext}
                  isActionDisabled={!!state.policies.length}
                  setModalActionContext={setModalActionContext}
                  setModalContext={setModalContext}
                  setPolicies={setPolicies}
                  setPolicy={setPolicy}
                />
                <Pagination
                  itemCount={policies?.length || 0}
                  widgetId="data-policy-list"
                  perPage={perPage}
                  page={page}
                  variant={PaginationVariant.bottom}
                  dropDirection="up"
                  perPageOptions={[]}
                  isStatic
                  onSetPage={(_event, newPage) => setPage(newPage)}
                  onPerPageSelect={(_event, newPerPage, newPage) => {
                    setPerPage(newPerPage);
                    setPage(newPage);
                  }}
                />
              </>
            )}
          </div>
        </>
      ) : (
        <StatusBox loaded={allLoaded} loadError={anyLoadError} />
      )}
    </ModalBody>
  );
};

type PolicyListViewProps = {
  dataPolicyInfo: DataPolicyType[];
  workloadNamespace: string;
  eligiblePolicies: DRPolicyType[];
  state: PolicyListViewState;
  dispatch: React.Dispatch<ManagePolicyStateAction>;
  setModalContext: (modalViewContext: ModalViewContext) => void;
  setModalActionContext: (modalActionContext: ModalActionContext) => void;
  setMessage: (error: MessageType) => void;
  loaded: boolean;
  loadError: any;
};

type PolicyListViewToolBarProps = {
  selectedPolicyCount: number;
  searchText: string;
  isActionDisabled: boolean;
  // A temporary prop for MCO to hide disable DR
  isActionHidden?: boolean;
  isSearchHidden?: boolean;
  onSearchChange: React.Dispatch<React.SetStateAction<string>>;
  setModalActionContext: (modalActionContext: ModalActionContext) => void;
  setMessage: (error: MessageType) => void;
};
