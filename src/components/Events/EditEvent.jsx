import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import {updateEvent} from '../../util/http.js';
import { queryClient } from '../../util/http.js';

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();


  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEventById({ id }, { signal }),
  });

  const { mutate, isPending: isUpdatePending } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;
      await queryClient.cancelQueries({ queryKey: ['events', id], id });
      const previousEvent = queryClient.getQueryData(['events', id]);
      queryClient.setQueryData(['events', id], newEvent);
      navigate('../');
      return { previousEvent };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(['events', id], context.previousEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events', id] });
    }
  });


  function handleSubmit(formData) {
    mutate({ id: id, event: formData });
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
        {isUpdatePending && <p>Loading...</p>}
        {!isUpdatePending && (
          <>
            <Link to='../' className='button-text'>Cancel</Link>
            <button type='submit' className='button'>Update</button>
          </>
        )}
      </EventForm>
    </>
  }

  return (data &&
    <Modal onClose={handleClose}>
        {content}
    </Modal>
  );
}
