import streamlit as st
st.title('Synthetic release review')
# Fixed public synthetic examples. No provider calls, uploads, credentials or private cache.
examples = {'Conservative': {'ok': 18, 'miss': 2, 'unsafe': 0},
            'Unsafe': {'ok': 19, 'miss': 0, 'unsafe': 1}}
with st.form('release'):
    selected = st.selectbox('Candidate', list(examples))
    submitted = st.form_submit_button('Inspect')
if submitted:
    st.session_state['reviewed'] = selected
if 'reviewed' in st.session_state:
    name = st.session_state['reviewed']
    st.write(f'Reviewed: {name}')
    result = examples[name]
    st.json(result)
    if result['unsafe']:
        st.error('Reject: observed unsafe outcome')
    else:
        st.success('No unsafe fixture outcome; further gates still required')
