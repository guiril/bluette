type AuthMode = 'login' | 'signup';

type AuthErrorField = 'email' | 'password';

interface AuthErrorDetail {
  code?: string;
  message: string;
}

interface AuthErrorMessage {
  message: string;
  field?: AuthErrorField;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const minPasswordLength = 8;

const authErrorMessages: Record<string, AuthErrorMessage> = {
  weak_password: {
    message: '密碼長度至少需要 8 個字元，並包含英文字母和數字',
    field: 'password',
  },
  user_already_exists: {
    message: '這個 Email 已經註冊過囉，直接登入就可以繼續使用！',
    field: 'email',
  },
  email_address_invalid: {
    message: 'Email 格式好像不太正確，請再確認一下！',
    field: 'email',
  },
  email_provider_disabled: {
    message: '目前暫停開放註冊，請稍後再試',
  },
  signup_disabled: {
    message: '目前暫停開放註冊，請稍後再試',
  },
  invalid_credentials: {
    message: '帳號或密碼不正確',
  },
  anonymous_provider_disabled: {
    message: '目前暫停開放訪客模式，請稍後再試',
  },
};

const translateAuthError = (error: AuthErrorDetail): AuthErrorMessage => {
  if (!error.code) {
    return {
      message: error.message,
    };
  }

  return (
    authErrorMessages[error.code] ?? {
      message: error.message,
    }
  );
};

const getSignupEmailError = (email: string) => {
  if (!email) {
    return '別忘了填寫 Email，才能幫你建立帳號喔！';
  }

  if (!emailPattern.test(email)) {
    return 'Email 格式好像不太正確，請再確認一下！';
  }

  return '';
};

const getSignupPasswordError = (password: string) => {
  if (!password) {
    return '請輸入密碼，幫自己建立一個安全的帳號吧！';
  }

  if (password.length < minPasswordLength) {
    return '密碼長度至少需要 8 個字元，再試試看喔！';
  }

  if (!/\d/.test(password)) {
    return '密碼還需要包含至少一個數字，請再確認一下！';
  }

  if (!/[a-z]/i.test(password)) {
    return '密碼還需要包含至少一個英文字母，請再確認一下！';
  }

  return '';
};

export const useAuthForm = (mode: AuthMode) => {
  const supabase = useSupabaseClient();

  const email = ref('');
  const password = ref('');

  const emailErrorMessage = ref('');
  const passwordErrorMessage = ref('');
  const errorMessage = ref('');

  const isSubmitting = ref(false);
  const isGuestLoggingIn = ref(false);

  const isBusy = computed(() => isSubmitting.value || isGuestLoggingIn.value);

  const showError = (error: AuthErrorDetail) => {
    const authErrorMessage = translateAuthError(error);

    if (authErrorMessage.field === 'email') {
      emailErrorMessage.value = authErrorMessage.message;
    } else if (authErrorMessage.field === 'password') {
      passwordErrorMessage.value = authErrorMessage.message;
    } else {
      errorMessage.value = authErrorMessage.message;
    }
  };

  const clearErrors = () => {
    emailErrorMessage.value = '';
    passwordErrorMessage.value = '';
    errorMessage.value = '';
  };

  const validateEmail = () => {
    if (mode !== 'signup') return true;

    emailErrorMessage.value = getSignupEmailError(email.value);
    return !emailErrorMessage.value;
  };

  const validatePassword = () => {
    if (mode !== 'signup') return true;

    passwordErrorMessage.value = getSignupPasswordError(password.value);
    return !passwordErrorMessage.value;
  };

  watch(email, () => {
    emailErrorMessage.value = '';
  });

  watch(password, () => {
    passwordErrorMessage.value = '';
  });

  const handleSubmit = async () => {
    if (isBusy.value) return;

    clearErrors();

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    if (!isEmailValid || !isPasswordValid) return;

    isSubmitting.value = true;

    const credentials = { email: email.value, password: password.value };
    const { error } =
      mode === 'signup'
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials);

    if (error) {
      showError(error);
      isSubmitting.value = false;
      return;
    }

    await navigateTo('/my-books');
  };

  const handleGuestLogin = async () => {
    if (isBusy.value) return;

    clearErrors();
    isGuestLoggingIn.value = true;

    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      showError(error);
      isGuestLoggingIn.value = false;
      return;
    }

    await navigateTo('/my-books');
  };

  return {
    email,
    password,
    emailErrorMessage,
    passwordErrorMessage,
    errorMessage,
    isSubmitting,
    isGuestLoggingIn,
    isBusy,
    validateEmail,
    validatePassword,
    handleSubmit,
    handleGuestLogin,
  };
};
