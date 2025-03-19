import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { UNSAVED_HOLD_CHANGES_WILL_BE_LOST_CONTINUE } from '../constants/AppConstants';
import { alertDialogInformationState, isEditHoldOnState } from '../global/recoilState';

const useExecuteAfterCheck = () => {
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [isEditHoldOn, setIsEditHoldOn] = useRecoilState(isEditHoldOnState);

  const executeAfterCheck = (fn) => {
    if (!isEditHoldOn) {
      return fn();
    }
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: UNSAVED_HOLD_CHANGES_WILL_BE_LOST_CONTINUE,
      actions: {
        primary: {
          text: 'Continue',
          onClick: (onClose) => {
            fn();
            setIsEditHoldOn(false);
            onClose();
          },
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          className: 'text-black',
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };
  return executeAfterCheck;
};

export default useExecuteAfterCheck;
