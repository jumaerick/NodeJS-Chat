@extends('layouts.listing')

<table class="table table-striped">
  <thead>
    <tr>
      <th>User ID</th>
      <th>Message</th>
      <th>Created At</th>
    </tr>
  </thead>

  <tbody>
    @foreach ($paginatedData as $item)
      <tr>
        <td>{{ $item['user_id'] }}</td>
        <td>{{ $item['message'] }}</td>
        <td>{{ $item['created_at'] }}</td>
      </tr>
    @endforeach
  </tbody>
</table>

<!-- Pagination links should go OUTSIDE the table -->
<div class="d-flex justify-content-center mt-3">
{{ $paginatedData->links('pagination::bootstrap-5') }}
</div>
