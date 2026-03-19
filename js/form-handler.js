document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const form = document.getElementById('callback-form');
    if (!form) return;

    const nameInput = document.getElementById('form-name');
    const phoneInput = document.getElementById('form-phone');
    const topicSelect = document.getElementById('form-topic');
    const consentCheckbox = document.getElementById('form-consent');
    const submitBtn = document.getElementById('form-submit');
    const formMessage = document.getElementById('form-message');

    // ===== Phone Mask =====
    const applyPhoneMask = (input) => {
        input.addEventListener('input', () => {
            let value = input.value.replace(/\D/g, '');

            if (value.length > 0 && value[0] !== '7') {
                value = value[0] === '8' ? `7${value.slice(1)}` : `7${value}`;
            }

            let formatted = '';
            if (value.length > 0) formatted = '+7';
            if (value.length > 1) formatted += ` (${value.slice(1, 4)}`;
            if (value.length >= 4) formatted += ')';
            if (value.length > 4) formatted += ` ${value.slice(4, 7)}`;
            if (value.length > 7) formatted += `-${value.slice(7, 9)}`;
            if (value.length > 9) formatted += `-${value.slice(9, 11)}`;

            input.value = formatted;
        });

        input.addEventListener('keydown', (e) => {
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
            if (allowedKeys.includes(e.key)) return;
            if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v'].includes(e.key.toLowerCase())) return;
            if (!/^\d$/.test(e.key)) e.preventDefault();
        });

        input.addEventListener('paste', () => {
            // Allow native paste; 'input' event fires after paste and applies mask
            setTimeout(() => input.dispatchEvent(new Event('input')), 0);
        });

        input.addEventListener('focus', () => {
            if (!input.value) input.value = '+7';
        });
    };

    if (phoneInput) applyPhoneMask(phoneInput);

    // ===== Validation =====
    const showError = (fieldId, message) => {
        const errorEl = document.getElementById(`error-${fieldId}`);
        const group = errorEl?.closest('.form-group');
        if (errorEl) errorEl.textContent = message;
        group?.classList.add('has-error');
    };

    const clearError = (fieldId) => {
        const errorEl = document.getElementById(`error-${fieldId}`);
        const group = errorEl?.closest('.form-group');
        if (errorEl) errorEl.textContent = '';
        group?.classList.remove('has-error');
    };

    const clearAllErrors = () => {
        ['name', 'phone', 'topic', 'consent'].forEach(clearError);
    };

    const validateForm = () => {
        let isValid = true;
        clearAllErrors();

        const name = nameInput.value.trim();
        if (!name) {
            showError('name', 'Введите ваше имя');
            isValid = false;
        } else if (name.length < 2) {
            showError('name', 'Имя должно содержать минимум 2 символа');
            isValid = false;
        }

        const phone = phoneInput.value.replace(/\D/g, '');
        if (!phone || phone.length < 11) {
            showError('phone', 'Введите корректный номер телефона');
            isValid = false;
        }

        if (!topicSelect.value) {
            showError('topic', 'Выберите тему обращения');
            isValid = false;
        }

        if (!consentCheckbox.checked) {
            showError('consent', 'Необходимо согласие на обработку данных');
            isValid = false;
        }

        return isValid;
    };

    // ===== Form Submission =====
    const setLoading = (loading) => {
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        submitBtn.disabled = loading;
        if (btnText) btnText.textContent = loading ? 'Отправка...' : 'Отправить заявку';
        if (btnLoader) btnLoader.hidden = !loading;
    };

    const showMessage = (type, text) => {
        formMessage.hidden = false;
        formMessage.className = `form-message ${type}`;
        formMessage.textContent = text;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        formMessage.hidden = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
            });
            const data = await response.json();

            setLoading(false);
            if (data.success) {
                showMessage('success', 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
                form.reset();
            } else {
                showMessage('error', data.message || 'Произошла ошибка. Попробуйте позже.');
            }
        } catch {
            setLoading(false);
            showMessage('error', 'Ошибка соединения. Пожалуйста, свяжитесь с нами по телефону: +7 (915) 057-30-74');
        }
    });

    // Clear errors on input
    nameInput?.addEventListener('input', () => clearError('name'));
    phoneInput?.addEventListener('input', () => clearError('phone'));
    topicSelect?.addEventListener('change', () => clearError('topic'));
    consentCheckbox?.addEventListener('change', () => clearError('consent'));
});
