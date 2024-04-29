import { Link, useNavigate, useParams, useSubmit, useNavigation, redirect } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { updateEvent } from '../../util/http.js';
import { queryClient } from '../../util/http.js';
import { fetchEventById } from '../../util/http.js';

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const submit = useSubmit();
  const { state } = useNavigation();

  const { data, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEventById({ id }, { signal }),
    staleTime: 10000,
  });

  // const { mutate, isPending: isUpdatePending } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;
  //     await queryClient.cancelQueries({ queryKey: ['events', id], id });
  //     const previousEvent = queryClient.getQueryData(['events', id]);
  //     queryClient.setQueryData(['events', id], newEvent);
  //     navigate('../');
  //     return { previousEvent };
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(['events', id], context.previousEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ['events', id] });
  //   }
  // });


  function handleSubmit(formData) {
    submit(formData, { method: 'PUT' });
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isError) {
    return (
      content = <>
        <ErrorBlock title="Failed to load event" message={error.info?.message || 'Failed to fetch events.'} >
          <div className='form-actions'>
            <Link to='../' className='button'>Okay</Link>
          </div>
        </ErrorBlock></>
    );
  }

  if (data) {
    content = <>
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {(state === 'submitting') ? <p>Loading...</p> :
          <>
            <Link to='../' className='button-text'>Cancel</Link>
            <button type='submit' className='button'>Update</button>
          </>

        }

      </EventForm>
    </>
  }

  return (data &&
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEventById({ id: params.id }, { signal }),
  })
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData.entries());
  await updateEvent({ id: params.id, event: updatedEventData });
  queryClient.invalidateQueries(['events']);
  return redirect('../');
}